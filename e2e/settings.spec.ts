
import { test, expect } from "@playwright/test";

test.describe.serial("Settings and Account Management", () => {
  test.use({ storageState: ".auth/user.json" });

  test("should allow user to update their profile", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible({
      timeout: 20000,
    });
    // Wait for profile to load by checking if the select trigger has a value
    await expect(
      page.locator('[data-slot="select-trigger"]:has-text("Casual")'),
    ).toBeVisible();

    const writingStyleTrigger = page
      .locator('[data-slot="select-trigger"]')
      .nth(2); // Assuming it's the 3rd select on the page
    await writingStyleTrigger.click();
    await page.getByRole("option", { name: "Formal" }).click();

    await page.getByRole("button", { name: "Save Changes" }).click();

    // Assert success toast
    await expect(page.getByText("Profile Saved")).toBeVisible({ timeout: 10000 });

    // Reload and verify change persisted
    await page.reload();
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible({
      timeout: 20000,
    });
    await expect(
      page.locator('[data-slot="select-trigger"]:has-text("Formal")'),
    ).toBeVisible();
  });

  test("should allow user to export their data", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible({
      timeout: 20000,
    });

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("link", { name: "Export My Data" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("lexity_export.json");
  });

  test("should allow a user to delete their own account", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible({
      timeout: 20000,
    });
    const userEmail = await page.locator("input#email").inputValue();
    expect(userEmail).not.toBe("");

    await page.getByRole("button", { name: "Delete Account" }).first().click();

    // Dialog appears
    const dialog = page.getByRole("dialog", {
      name: "Confirm Account Deletion",
    });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("Email").fill(userEmail);
    await dialog.getByRole("button", { name: "Delete Account" }).click();

    // Assert redirection to homepage and success toast
    await expect(page).toHaveURL("/", { timeout: 10000 });
    await expect(page.getByText("Account Deletion Initiated")).toBeVisible();
  });
});