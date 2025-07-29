import { test, expect } from "@playwright/test";

test.describe("Admin Dashboard Flow", () => {
  test.use({ storageState: ".auth/admin.json" });

  test("should allow an admin to manage products", async ({ page }) => {
    await page.goto("/admin");

    // 1. Navigate to Products Tab
    await page.getByRole("tab", { name: "Products" }).click();
    await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();

    // 2. Add a new product
    await page.getByRole("button", { name: "Add New Product" }).click();
    const dialog = page.getByRole("dialog", { name: "Create New Product" });
    await expect(dialog).toBeVisible();

    const newProductName = `Test Product ${Date.now()}`;
    await dialog.getByLabel("Name").fill(newProductName);
    await dialog.getByLabel("Brand").fill("Test Brand");
    await dialog.getByLabel("Type").fill("Serum");
    await dialog.getByLabel("Description").fill("A test description.");
    await dialog.getByRole("button", { name: "Save Product" }).click();

    // 3. Verify the product appears in the list
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole("cell", { name: newProductName })).toBeVisible();

    // 4. Delete the product
    const productRow = page.locator("tr", { hasText: newProductName });
    await productRow.getByRole("button", { name: "Delete" }).click();

    // 5. Verify the product is removed from the list
    await expect(page.getByRole("cell", { name: newProductName })).not.toBeVisible();
  });
});