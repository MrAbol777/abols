import { test, expect, devices } from "@playwright/test";

// Mobile viewport so the hamburger menu is what renders.
test.use({ ...devices["iPhone 13"] });

test.describe("mobile hamburger menu", () => {
  test("opens the drawer with nav items when tapped", async ({ page }) => {
    await page.goto("/");

    // Hamburger button is visible on mobile, desktop nav is not.
    const burger = page.getByRole("button", { name: "منو" });
    await expect(burger).toBeVisible();
    await expect(page.getByRole("navigation", { name: "اصلی" })).toBeHidden();

    // Open the drawer.
    await burger.click();
    const dialog = page.getByRole("dialog", { name: "منوی موبایل" });
    await expect(dialog).toBeVisible();

    // Drawer contains the main nav + actions.
    await expect(dialog.getByRole("link", { name: /فروشگاه/ }).first()).toBeVisible();
    await expect(dialog.getByRole("link", { name: /سبد خرید/ }).first()).toBeVisible();
    await expect(dialog.getByRole("link", { name: /ورود/ }).first()).toBeVisible();
  });

  test("navigation from the drawer works", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "منو" }).click();
    await page.getByRole("dialog", { name: "منوی موبایل" }).getByRole("link", { name: "فروشگاه" }).click();
    await expect(page).toHaveURL(/\/shop$/);
  });

  test("closes on Escape", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "منو" }).click();
    await expect(page.getByRole("dialog", { name: "منوی موبایل" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "منوی موبایل" })).toBeHidden();
  });
});