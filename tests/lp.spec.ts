import { test, expect } from '@playwright/test';

// Focused ads-LP checks. Geo-consent stays in tests/api-geo-consent.spec.ts
// (preview project); this file hits the prerendered page on astro dev only.

const SIGNUP_ORIGIN = 'https://app.buildworkpro.com/signup';
const LP_PATH = '/lp/procore-alternative/';

test.describe('ads landing page /lp/procore-alternative/', () => {
  test('does not 404, is noindex, and has a signup CTA', async ({ page }) => {
    const response = await page.goto(LP_PATH);
    expect(response?.status()).toBe(200);

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);

    const trial = page.getByRole('link', { name: /start free trial/i });
    await expect(trial.first()).toBeVisible();
    await expect(trial.first()).toHaveAttribute('href', SIGNUP_ORIGIN);

    // Paid destination: no competing contact CTA, no Header mega-nav.
    await expect(page.getByRole('link', { name: /talk to us/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /features/i })).toHaveCount(0);
  });
});
