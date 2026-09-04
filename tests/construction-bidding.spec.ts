import { test, expect } from '@playwright/test';

// Organic bet: `/features/construction-bidding/` should match the
// construction-bidding-software cluster (query-led title/H1, subcontractor
// estimating workflow, GC-first contrast, FAQPage schema).

test.describe('construction bidding software feature', () => {
  test('title and H1 lead with construction bidding software', async ({ page }) => {
    const response = await page.goto('/features/construction-bidding/');
    expect(response?.status()).toBe(200);

    await expect(page).toHaveTitle(/Construction Bidding Software for Subs \| BuildWorkPro/);
    await expect(page.locator('main h1')).toHaveText(
      /Construction Bidding Software for Subcontractors/
    );

    const title = await page.title();
    expect(title.length).toBeLessThanOrEqual(60);
  });

  test('meta description leads with construction bidding software and the trial', async ({
    page,
  }) => {
    await page.goto('/features/construction-bidding/');
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toMatch(/construction bidding software/i);
    expect(description).toMatch(/subcontractors/i);
    expect(description).toMatch(/\$79/);
    expect(description).toMatch(/14-day/i);
    expect(description!.length).toBeLessThanOrEqual(155);
  });

  test('covers subcontractor workflow and GC-first contrast', async ({ page }) => {
    await page.goto('/features/construction-bidding/');
    await expect(
      page.getByRole('heading', { name: /The subcontractor estimating workflow/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Not GC bid-leveling software/i })
    ).toBeVisible();
    await expect(
      page.locator('main a[href="/blog/subcontractor-vs-general-contractor-software/"]').first()
    ).toBeVisible();
  });

  test('carries FAQPage structured data for the bidding cluster', async ({ page }) => {
    await page.goto('/features/construction-bidding/');
    const jsonld = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(jsonld.some((s) => s.includes('FAQPage'))).toBe(true);
    expect(jsonld.some((s) => s.includes('What is construction bidding software?'))).toBe(true);
    expect(
      jsonld.some((s) => s.includes('Is there a free construction bidding software option?'))
    ).toBe(true);
  });
});

test.describe('internal links to construction bidding software', () => {
  test('change-orders overview links to the bidding page', async ({ page }) => {
    await page.goto('/features/change-orders/');
    const link = page.locator('main a[href="/features/construction-bidding/"]').first();
    await expect(link).toBeVisible();
    await expect(link).toHaveText(/original bid/i);
  });

  test('construction CRM converts a lead into a construction bid', async ({ page }) => {
    await page.goto('/features/construction-crm/');
    const link = page.locator('main a[href="/features/construction-bidding/"]').first();
    await expect(link).toBeVisible();
    await expect(link).toHaveText(/construction bid/i);
  });

  test('AIA pay application guide links the SOV back to bidding software', async ({ page }) => {
    await page.goto('/blog/aia-pay-application-guide/');
    const link = page.locator('main a[href="/features/construction-bidding/"]').first();
    await expect(link).toBeVisible();
    await expect(link).toHaveText(/construction bidding software/i);
  });
});
