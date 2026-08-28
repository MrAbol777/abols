import { test, expect } from "@playwright/test";

test.describe("public storefront", () => {
  test("homepage renders brand and sections", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/ابول استور|Abol Store/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Trust strip + a CTA to the shop
    await expect(page.getByRole("link", { name: "مشاهده محصولات" }).first()).toBeVisible();
  });

  test("shop lists seeded products and can filter by category", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.getByRole("heading", { name: "فروشگاه ابول استور" })).toBeVisible();
    // Seeded CP product
    await expect(page.getByText("420 CP", { exact: false }).first()).toBeVisible();

    await page.goto("/shop?category=cp");
    await expect(page.getByText("420 CP", { exact: false }).first()).toBeVisible();
  });

  test("product detail shows price and add-to-cart", async ({ page }) => {
    await page.goto("/shop/cp-420");
    await expect(page.getByRole("heading", { name: "420 CP" })).toBeVisible();
    await expect(page.getByRole("button", { name: "افزودن به سبد خرید" })).toBeVisible();
  });

  test("tracking page accepts an unknown code gracefully", async ({ page }) => {
    await page.goto("/tracking?code=AB-XXXXXX");
    await expect(page.getByText("سفارشی با این کد پیدا نشد")).toBeVisible();
  });

  test("content pages render real content", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: "درباره ما" })).toBeVisible();
    await page.goto("/rules");
    await expect(page.getByRole("heading", { name: "قوانین خرید" })).toBeVisible();
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: "حریم خصوصی" })).toBeVisible();
    await page.goto("/refund");
    await expect(page.getByRole("heading", { name: "بازگشت وجه" })).toBeVisible();
    await page.goto("/tutorial");
    await expect(page.getByRole("heading", { name: "آموزش خرید" })).toBeVisible();
    await page.goto("/contact");
    await expect(page.getByRole("heading", { name: "در ارتباط باشید" })).toBeVisible();
    await page.goto("/faq");
    await expect(page.getByText("سوالات متداول", { exact: false }).first()).toBeVisible();
  });
});

const randomPhone = () => `09${String(Math.floor(100000000 + Math.random() * 899999999))}`;

test.describe("customer auth", () => {
  test("login page shows both tabs", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "ورود به حساب" })).toBeVisible();
    await page.goto("/login?mode=register");
    await expect(page.getByRole("heading", { name: "ساخت حساب کاربری" })).toBeVisible();
  });

  test("registering redirects to dashboard", async ({ page }) => {
    await page.goto("/login?mode=register");
    await page.getByLabel("نام و نام خانوادگی").fill("تست ای۲ای");
    await page.getByLabel("شماره موبایل").fill(randomPhone());
    await page.getByLabel("رمز عبور (حداقل ۸ کاراکتر)").fill("testpass123");
    await page.getByRole("button", { name: "ثبت‌نام" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("unauth dashboard redirects to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("admin login page", () => {
  test("renders and rejects bad creds with generic error", async ({ page }) => {
    // Use a random phone so repeated test runs never trigger the real admin's
    // brute-force lockout (5 failures / 15 min).
    await page.goto("/admin/login");
    await page.getByLabel("شماره موبایل").fill(randomPhone());
    await page.getByLabel("رمز عبور").fill("definitely-wrong");
    await page.getByRole("button", { name: "ورود" }).click();
    await expect(page.getByText("شماره موبایل یا رمز عبور صحیح نیست.")).toBeVisible();
  });

  test("admin area redirects unauth to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});