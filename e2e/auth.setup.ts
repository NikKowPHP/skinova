import { test as setup, expect } from "@playwright/test";

const authFile = ".auth/user.json";

setup("authenticate", async ({ page }) => {
  // This setup assumes a test user exists in the database.
  // The credentials should be stored in environment variables.
  const testUserEmail = process.env.TEST_USER_EMAIL || "test@example.com";
  const testUserPassword =
    process.env.TEST_USER_PASSWORD || "PasswordForTesting123!";

  await page.goto("/login");
  await page.getByLabel("Email address").fill(testUserEmail);
  await page.getByLabel("Password").fill(testUserPassword);
  await page.getByRole("button", { name: "Sign In" }).click();

  // Wait for the page to redirect to the dashboard, confirming successful login.
  await expect(page).toHaveURL("/dashboard", { timeout: 20000 });

  // Accept the cookie banner if it appears, so it doesn't block other tests.
  const cookieBanner = page.getByText("We use cookies to enhance your experience.");
  if (await cookieBanner.isVisible()) {
    await page.getByRole("button", { name: "Accept" }).click();
  }

  // Programmatically ensure the user has completed the skin profile onboarding.
  await page.request.post("/api/user/onboard", {
    data: {
      skinType: "NORMAL",
      primaryConcern: "Redness",
    },
  });
  
  await page.request.post("/api/user/complete-onboarding");

  // Programmatically create a scan and trigger its analysis for the test user.
  const scanResponse = await page.request.post("/api/scan", {
    data: {
      imageUrl: 'https://via.placeholder.com/150',
      notes: 'E2E test scan'
    }
  });
  const scan = await scanResponse.json();
  await page.request.post(`/api/scan/analyze`, {
    data: {
      scanId: scan.id
    }
  });


  // Reload the page to ensure client-side state is updated.
  await page.reload();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({
    timeout: 20000,
  });

  // Save the authentication state to a file.
  await page.context().storageState({ path: authFile });
});