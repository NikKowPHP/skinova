import { test, expect } from "@playwright/test";

test.describe("Scan Review and Consultation Flow", () => {
  test.use({ storageState: ".auth/user.json" });

  test("should allow user to view a scan and start a consultation", async ({
    page,
    context,
  }) => {
    // 1. Navigate to the dashboard and find the most recent scan
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await page.locator('[data-slot="card"]:has-text("Scan from")').first().click();

    // 2. Verify being on the scan analysis page
    await expect(page).toHaveURL(/.*\/scan\/.*/);
    await expect(page.getByRole("heading", { name: /Scan Analysis:/ })).toBeVisible();

    // Wait for analysis to be visible
    await expect(page.getByText("Identified Concerns")).toBeVisible({ timeout: 30000 });
    await expect(page.getByText("Mild Redness")).toBeVisible();

    // 3. Start a consultation
    const consultationButton = page.getByRole("button", { name: /Start a Consultation/ });
    await consultationButton.click();
    
    // 4. Verify redirection to Stripe checkout
    // Because the checkout page is external, we listen for the new page popup
    const pagePromise = context.waitForEvent('page');
    const newPage = await pagePromise;
    await newPage.waitForLoadState();

    await expect(newPage).toHaveURL(/.*checkout.stripe.com.*/);
    // We can close the new page as we've verified the navigation
    await newPage.close();
  });
});