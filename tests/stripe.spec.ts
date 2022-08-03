import { expect, test } from "@playwright/test";

test.describe("Stripe", () => {
  test("shows tax for UK", async ({ page }) => {
    await page.goto("/checkout");

    await page.waitForSelector("#name");
    await page.type("#name", "Testy Testerton");

    await page.waitForSelector("#country");
    await page.selectOption("#country", "GB");

    await expect(page.locator("#vat")).toHaveText("$0.00", { timeout: 10000 });
  });

  test("shows tax for NL", async ({ page }) => {
    await page.goto("/checkout");

    await page.waitForSelector("#name");
    await page.type("#name", "Testy Testerton");

    await page.waitForSelector("#country");
    await page.selectOption("#country", "NL");

    await expect(page.locator("#vat")).toHaveText("$2.10", { timeout: 10000 });
  });

  test("allows order", async ({ page }) => {
    await page.goto("/");

    await page.locator("text=Checkout").click();
    await page.waitForURL("http://localhost:3000/checkout");

    await page.waitForSelector("#submit");
    await expect(page.locator("#submit")).toBeDisabled();

    await page.waitForSelector("#name");
    await page.type("#name", "Testy Testerton");

    await page.waitForSelector("#country");
    await page.selectOption("#country", "NL");

    const iframe = page
      .frameLocator('iframe[name*="__privateStripeFrame"]')
      .first();
    await iframe.locator("#Field-numberInput").fill("4242424242424242");
    await iframe.locator("#Field-cvcInput").fill("123");
    await iframe.locator("#Field-expiryInput").fill("12/30");
    await iframe.locator("#Field-countryInput").selectOption("NL");

    await page.click("#submit");

    await page.waitForSelector("#payment-message");
    await expect(page.locator("#payment-message")).toHaveText(
      "Payment succeeded!",
      { timeout: 10000 }
    );
  });

  test("stripe webhooks available respond with 400", async ({ request }) => {
    const response = await request.post("/api/webhooks");
    const status = response.status();
    expect(status).toBe(400);
  });
});
