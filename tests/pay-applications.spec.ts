import { test, expect } from '@playwright/test';

// Organic bet: `/features/pay-applications/` should match the
// `aia billing software` SERP pattern (query-led title/H1, G702/G703 copy,
// template-page feeder, FAQ + SoftwareApplication schema).

test.describe('pay applications / AIA billing feature', () => {
  test('title and H1 lead with pay application software', async ({ page }) => {
    const response = await page.goto('/features/pay-applications/');
    expect(response?.status()).toBe(200);

    await expect(page).toHaveTitle(/^Pay Application Software for Subcontractors \| AIA-Style$/);
    expect((await page.title()).length).toBeLessThanOrEqual(60);
    await expect(page.locator('main h1')).toHaveText(/Pay Application Software for Subcontractors/);
    await expect(page.locator('main h1 + p')).toContainText(/AIA billing software/i);
    await expect(page.locator('main h2').first()).toHaveText(/Pay application software/i);
  });

  test('meta description leads with pay application software, G702/G703, and $79/mo', async ({
    page,
  }) => {
    await page.goto('/features/pay-applications/');
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toMatch(/^Pay application software/i);
    expect(description).toMatch(/AIA-style G702\/G703/i);
    expect(description!.length).toBeLessThanOrEqual(155);
    expect(description).toMatch(/schedule of values/i);
    expect(description).toMatch(/retainage/i);
    expect(description).toMatch(/\$79/);
    expect(description).toMatch(/14-day/i);
  });

  test('compares AIA billing vs Excel and links to the G702/G703 template', async ({ page }) => {
    await page.goto('/features/pay-applications/');
    await expect(
      page.getByRole('heading', { name: /AIA billing vs Excel G702\/G703/i })
    ).toBeVisible();
    await expect(page.locator('main a[href="/templates/aia-g702-g703/"]').first()).toBeVisible();
  });

  test('carries FAQPage and SoftwareApplication structured data', async ({ page }) => {
    await page.goto('/features/pay-applications/');
    const jsonld = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(jsonld.some((s) => s.includes('FAQPage'))).toBe(true);
    expect(jsonld.some((s) => s.includes('SoftwareApplication'))).toBe(true);
    expect(jsonld.some((s) => s.includes('AIA Billing Software'))).toBe(true);
  });
});

test.describe('internal links to AIA billing software', () => {
  test('homepage Pay Applications card uses the money-term anchor', async ({ page }) => {
    await page.goto('/');
    const cardLink = page.locator('#features a[href="/features/pay-applications/"]');
    await expect(cardLink).toBeVisible();
    await expect(cardLink).toHaveText(/AIA billing software/i);
  });
});
