import { test, expect, type Page } from "@playwright/test";

const randomPhone = () => `09${String(Math.floor(100000000 + Math.random() * 899999999))}`;

/** Minimal valid 1x1 PNG bytes. */
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

async function checkoutOneProduct(page: Page): Promise<{ code: string; phone: string }> {
  const phone = randomPhone();

  // From the product page, add to cart and go to the cart.
  await page.goto("/shop/cp-420");
  await page.getByRole("button", { name: "افزودن به سبد خرید" }).click();
  await page.getByRole("link", { name: /مشاهده سبد خرید/ }).click();
  await expect(page.getByRole("heading", { name: "سبد خرید" })).toBeVisible();

  // Go to checkout.
  await page.getByRole("link", { name: "ادامه و ثبت سفارش" }).click();
  await expect(page.getByRole("heading", { name: "ثبت سفارش" })).toBeVisible();

  // Fill customer info and submit.
  await page.getByLabel(/نام و نام خانوادگی/).fill("ای۲ای کامل");
  await page.getByLabel(/شماره موبایل/).fill(phone);
  await page.getByRole("button", { name: /ثبت سفارش و پرداخت/ }).click();

  // Should land on the tracking page with the new code.
  await page.waitForURL(/\/tracking\?code=/);
  const url = page.url();
  const match = url.match(/code=(AB-[\w]+)/);
  if (!match) throw new Error(`no tracking code in URL: ${url}`);
  return { code: match[1], phone };
}

test.describe("full checkout happy path", () => {
  test("add to cart -> checkout -> order created -> tracking shows it", async ({ page }) => {
    const { code } = await checkoutOneProduct(page);

    // Tracking page shows the order + the receipt upload form.
    await expect(page.getByText(new RegExp(code))).toBeVisible();
    await expect(page.getByText("در انتظار پرداخت").first()).toBeVisible();
    await expect(page.getByText("ارسال رسید کارت‌به‌کارت")).toBeVisible();
  });

  test("receipt upload moves the order to awaiting review", async ({ page }) => {
    const { phone } = await checkoutOneProduct(page);

    // The upload form is on the tracking page for this order.
    await page.getByLabel(/شماره موبایل ثبت/).fill(phone);
    await page
      .locator('input[type="file"]')
      .setInputFiles({ name: "receipt.png", mimeType: "image/png", buffer: TINY_PNG });
    await page.getByRole("button", { name: "ارسال رسید" }).click();

    // Success message appears; status changes to awaiting review.
    await expect(page.getByText(/رسید شما ثبت شد/)).toBeVisible();
    await expect(page.getByText("در انتظار بررسی مدیر").first()).toBeVisible();
  });
});