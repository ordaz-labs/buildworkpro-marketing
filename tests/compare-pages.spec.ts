import { test, expect } from '@playwright/test';

// JobTread + Knowify alternative pages (issue #147/#602). Pattern-inherited
// from the three existing compare pages, so a render + table + pricing
// disclaimer check per page suffices.
for (const [slug, name] of [
  ['jobtread-alternative', 'JobTread'],
  ['knowify-alternative', 'Knowify'],
] as const) {
  test(`/compare/${slug}/ renders with table and pricing disclaimer`, async ({ page }) => {
    await page.goto(`/compare/${slug}/`);
    await expect(page.locator('main h1')).toContainText(new RegExp(name, 'i'));
    await expect(page.getByText(/at a glance/i)).toBeVisible();
    await expect(page.getByText(/Verify current pricing/i).first()).toBeVisible();
  });
}

// Competitor cost-guide posts (issue #148/#603).
for (const [slug, h1] of [
  ['buildertrend-pricing', /Buildertrend Pricing/i],
  ['procore-pricing-for-subcontractors', /Procore Pricing/i],
] as const) {
  test(`/blog/${slug}/ renders with sources and verify disclaimer`, async ({ page }) => {
    await page.goto(`/blog/${slug}/`);
    await expect(page.locator('main h1')).toHaveText(h1);
    await expect(page.getByText(/verify current pricing/i).first()).toBeVisible();
    await expect(page.getByText(/Key takeaways/i)).toBeVisible();
  });
}

test('buildertrend pricing title, H1, and meta lead with the money query', async ({ page }) => {
  const response = await page.goto('/blog/buildertrend-pricing/');
  expect(response?.status()).toBe(200);

  await expect(page).toHaveTitle(/^Buildertrend Pricing 2026: Cost, Plans & Quotes$/);
  const title = await page.title();
  expect(title.length).toBeLessThanOrEqual(60);

  await expect(page.locator('main h1')).toHaveText(
    /Buildertrend Pricing 2026: Cost, Plans & Quotes/
  );

  const description = await page.locator('meta[name="description"]').getAttribute('content');
  expect(description).toMatch(/^Buildertrend pricing/i);
  expect(description).toMatch(/cost/i);
  expect(description).toMatch(/subcontractors/i);

  await expect(
    page.locator('main a[href="/compare/buildertrend-alternative/"]').first()
  ).toBeVisible();
  await expect(
    page.locator('main a[href="/blog/procore-pricing-for-subcontractors/"]').first()
  ).toBeVisible();
  await expect(page.locator('main a[href="/pricing/"]').first()).toBeVisible();
});

test('procore pricing title, H1, and meta lead with the money query', async ({ page }) => {
  const response = await page.goto('/blog/procore-pricing-for-subcontractors/');
  expect(response?.status()).toBe(200);

  await expect(page).toHaveTitle(/^Procore Pricing 2026: Cost, Plans & Quotes$/);
  const title = await page.title();
  expect(title.length).toBeLessThanOrEqual(60);

  await expect(page.locator('main h1')).toHaveText(/Procore Pricing 2026: Cost, Plans & Quotes/);

  const description = await page.locator('meta[name="description"]').getAttribute('content');
  expect(description).toMatch(/^Procore pricing/i);
  expect(description).toMatch(/cost/i);
  expect(description).toMatch(/subcontractors/i);
  expect(description!.length).toBeLessThanOrEqual(155);

  await expect(page.locator('main a[href="/compare/procore-alternative/"]').first()).toBeVisible();
  await expect(page.locator('main a[href="/blog/buildertrend-pricing/"]').first()).toBeVisible();
  await expect(page.locator('main a[href="/features/construction-crm/"]').first()).toBeVisible();
  await expect(
    page.locator('main a[href="/features/construction-bidding/"]').first()
  ).toBeVisible();
  await expect(page.locator('main a[href="/pricing/"]').first()).toBeVisible();

  const jsonld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(jsonld.some((s) => s.includes('FAQPage'))).toBe(true);
  expect(jsonld.some((s) => s.includes('How much does Procore cost?'))).toBe(true);
  expect(jsonld.some((s) => s.includes("What are Procore's pricing plans?"))).toBe(true);
});

test('compare and Procore pricing pages link to buildertrend pricing', async ({ page }) => {
  await page.goto('/compare/buildertrend-alternative/');
  const compareLink = page.locator('main a[href="/blog/buildertrend-pricing/"]').first();
  await expect(compareLink).toBeVisible();
  await expect(compareLink).toHaveText(/Buildertrend pricing and cost/i);

  await page.goto('/blog/procore-pricing-for-subcontractors/');
  const procoreLink = page.locator('main a[href="/blog/buildertrend-pricing/"]').first();
  await expect(procoreLink).toBeVisible();
  await expect(procoreLink).toHaveText(/Buildertrend pricing and cost/i);
});

test('related pages link to Procore pricing', async ({ page }) => {
  await page.goto('/features/construction-crm/');
  const crmLink = page.locator('main a[href="/blog/procore-pricing-for-subcontractors/"]').first();
  await expect(crmLink).toBeVisible();
  await expect(crmLink).toHaveText(/Procore pricing for subcontractors/i);

  await page.goto('/features/construction-bidding/');
  const bidLink = page.locator('main a[href="/blog/procore-pricing-for-subcontractors/"]').first();
  await expect(bidLink).toBeVisible();
  await expect(bidLink).toHaveText(/Procore pricing for subcontractors/i);

  await page.goto('/blog/buildertrend-pricing/');
  const btLink = page.locator('main a[href="/blog/procore-pricing-for-subcontractors/"]').first();
  await expect(btLink).toBeVisible();
  await expect(btLink).toHaveText(/Procore pricing for subcontractors/i);
});
