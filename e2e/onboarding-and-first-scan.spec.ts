import { test, expect } from "@playwright/test";

test("should guide a new user through sign up, onboarding, and their first scan", async ({
  page,
}) => {
  // This test requires a fresh, un-onboarded user for each run.
  const email = `onboarding-user-${Date.now()}@example.com`;
  const password = "PasswordForTesting123!";

  // 1. Sign up.
  await page.goto("/signup");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign up" }).click();

  // 2. Complete Onboarding Wizard
  await expect(
    page.getByRole("dialog", { name: "Welcome to Skinova!" }),
  ).toBeVisible({ timeout: 15000 });

  // Step 1: Welcome
  await page.getByRole("button", { name: "Next" }).click();

  // Step 2: Skin Type
  await expect(page.getByText("What is your skin type?")).toBeVisible();
  await page.locator('[data-slot="select-trigger"]').click();
  await page.getByRole("option", { name: "Normal" }).click();
  await page.getByRole("button", { name: "Next" }).click();

  // Step 3: Primary Concern
  await expect(page.getByText("What is your primary skin concern?")).toBeVisible();
  await page.locator('[data-slot="select-trigger"]').click();
  await page.getByRole("option", { name: "Acne" }).click();
  await page.getByRole("button", { name: "Finish Setup" }).click();

  // 4. Wizard closes, user is prompted to start first scan
  await expect(
    page.getByRole("dialog", { name: "Your First Scan" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Go to Scan Page" }).click();

  // 5. Land on scan page and submit a scan
  await expect(page).toHaveURL("/scan");
  await expect(page.getByRole("heading", { name: "New Skin Scan" })).toBeVisible();
  
  // The analysis button click will be mocked, but we verify it starts the process
  // The API response will redirect, which we'll wait for.
  await page.getByRole("button", { name: "Analyze My Skin" }).click();

  // 6. Verify redirection to analysis page and see processing state
  await expect(page).toHaveURL(/.*\/scan\/.*/, { timeout: 20000 });
  await expect(page.getByText("Analysis in Progress...")).toBeVisible({ timeout: 10000 });
});