import { test, expect } from '@playwright/test';

// Organic bet: `/features/change-orders/` should match the
// construction-change-order-software cluster (query-led title/H1, subcontractor
// workflow, GC-first contrast, FAQPage schema).

test.describe('construction change order software feature', () => {
  test('title and H1 lead with construction change order software', async ({ page }) => {
    const response = await page.goto('/features/change-orders/');
    expect(response?.status()).toBe(200);

    await expect(page).toHaveTitle(/Construction Change Order Software \| BuildWorkPro/);
    await expect(page.locator('main h1')).toHaveText(
      /Construction Change Order Software for Subcontractors/
    );

    const title = await page.title();
    expect(title.length).toBeLessThanOrEqual(60);
  });

  test('meta description leads with construction change order software and the trial', async ({
    page,
  }) => {
    await page.goto('/features/change-orders/');
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toMatch(/construction change order software/i);
    expect(description).toMatch(/subcontractors/i);
    expect(description).toMatch(/\$79/);
    expect(description).toMatch(/14-day/i);
    expect(description!.length).toBeLessThanOrEqual(155);
  });

  test('covers subcontractor workflow, AIA docs, and GC-first contrast', async ({ page }) => {
    await page.goto('/features/change-orders/');
    await expect(
      page.getByRole('heading', { name: /The subcontractor change-order workflow/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /AIA-style change order documents/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Not GC change-order software/i })
    ).toBeVisible();
    await expect(page.locator('main a[href="/templates/change-order/"]').first()).toBeVisible();
    await expect(
      page.locator('main a[href="/blog/subcontractor-vs-general-contractor-software/"]').first()
    ).toBeVisible();
  });

  test('carries FAQPage structured data for the change-order cluster', async ({ page }) => {
    await page.goto('/features/change-orders/');
    const jsonld = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(jsonld.some((s) => s.includes('FAQPage'))).toBe(true);
    expect(jsonld.some((s) => s.includes('What is construction change order software?'))).toBe(
      true
    );
    expect(jsonld.some((s) => s.includes('Is there a construction change order app?'))).toBe(true);
    expect(
      jsonld.some((s) => s.includes('Does BuildWorkPro produce AIA-style change order documents?'))
    ).toBe(true);
  });
});

test.describe('internal links to construction change order software', () => {
  test('homepage Change Orders card uses the money-term anchor', async ({ page }) => {
    await page.goto('/');
    const cardLink = page.locator('#features a[href="/features/change-orders/"]');
    await expect(cardLink).toBeVisible();
    await expect(cardLink).toHaveText(/change order software/i);
  });

  test('construction bidding links won-job extras to construction change orders', async ({
    page,
  }) => {
    await page.goto('/features/construction-bidding/');
    const link = page.locator('main a[href="/features/change-orders/"]').first();
    await expect(link).toBeVisible();
    await expect(link).toHaveText(/construction change orders/i);
  });

  test('AIA pay apps pull the contract sum from construction change orders', async ({ page }) => {
    await page.goto('/features/pay-applications/');
    const link = page.locator('main a[href="/features/change-orders/"]').first();
    await expect(link).toBeVisible();
    await expect(link).toHaveText(/construction change orders/i);
  });

  test('construction CRM keeps change orders on the same won-job record', async ({ page }) => {
    await page.goto('/features/construction-crm/');
    const link = page.locator('main a[href="/features/change-orders/"]').first();
    await expect(link).toBeVisible();
    await expect(link).toHaveText(/construction change orders/i);
  });
});
