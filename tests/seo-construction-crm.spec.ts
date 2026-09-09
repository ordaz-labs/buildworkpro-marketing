import { test, expect } from '@playwright/test';

// Organic bet: /features/construction-crm/ should win clicks for the rising
// GSC cluster (construction lead software, construction sales software,
// construction sales crm, crm for construction). Assert the SERP-facing
// strings and the internal links that support that bet.

test.describe('construction CRM organic SEO', () => {
  test('title, H1, and meta lead with CRM / lead software / sales CRM', async ({ page }) => {
    const response = await page.goto('/features/construction-crm/');
    expect(response?.status()).toBe(200);

    const title = await page.title();
    expect(title.length, `title is ${title.length} chars: ${title}`).toBeLessThanOrEqual(60);
    expect(title).toMatch(/sales crm/i);
    expect(title).toMatch(/lead software/i);

    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).toHaveText(/construction crm/i);
    await expect(h1).toHaveText(/lead software/i);

    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect(description!.length, `meta is ${description!.length} chars`).toBeGreaterThanOrEqual(145);
    expect(description!.length, `meta is ${description!.length} chars`).toBeLessThanOrEqual(165);
    expect(description).toMatch(/lead software/i);
    expect(description).toMatch(/sales crm/i);
    expect(description).toMatch(/subcontractor/i);
  });

  test('FAQPage schema and lead-to-bid / pay-app internal links', async ({ page }) => {
    await page.goto('/features/construction-crm/');

    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faqPage = jsonLd
      .map((text) => {
        try {
          return JSON.parse(text) as { '@type'?: string; mainEntity?: unknown[] };
        } catch {
          return null;
        }
      })
      .find((node) => node?.['@type'] === 'FAQPage');

    expect(faqPage, 'FAQPage JSON-LD should be present').toBeTruthy();
    expect(faqPage!.mainEntity?.length ?? 0).toBeGreaterThanOrEqual(6);

    const faqBlob = JSON.stringify(faqPage);
    expect(faqBlob).toMatch(/construction lead software/i);
    expect(faqBlob).toMatch(/construction sales crm/i);

    await expect(page.locator('a[href="/features/construction-bidding/"]')).not.toHaveCount(0);
    await expect(page.locator('a[href="/features/pay-applications/"]')).not.toHaveCount(0);
  });

  test('related pages link into construction-crm', async ({ page }) => {
    await page.goto('/blog/how-to-create-construction-bid/');
    await expect(page.locator('a[href="/features/construction-crm/"]')).not.toHaveCount(0);

    await page.goto('/features/project-management/');
    await expect(page.locator('a[href="/features/construction-crm/"]')).not.toHaveCount(0);
  });
});
