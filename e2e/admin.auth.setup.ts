import { test as setup, expect } from "@playwright/test";

const authFile = ".auth/admin.json";

setup("authenticate as admin", async ({ page }) => {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@skinova.app";
  const adminPassword = process.env.ADMIN_PASSWORD || "PasswordForTesting123!"; // Assume a default dev password

  await page.goto("/login");
  await page.getByLabel("Email address").fill(adminEmail);
  await page.getByLabel("Password").fill(adminPassword);
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL("/dashboard", { timeout: 20000 });

  await page.context().storageState({ path: authFile });
});