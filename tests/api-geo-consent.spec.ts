import { test, expect, type Page } from '@playwright/test';

// Geo-gated consent default (issue #125). US is the target market: visitors
// outside the EEA/UK/CH get measurement on by default with a working opt-out;
// opt-in is preserved for the EEA list, and every failure path stays opt-in.
//
// Runs in the `api-` (preview) project on purpose: the geo default is enabled
// only in production builds (`geoDefaultEnabled` in Layout.astro), because
// under `astro dev` the /api/geo/ SSR request makes Vite re-optimize the SSR
// dep graph and full-reload every open page. The preview server serves the
// built output, where the flag is on. The /api/geo/ lookup is stubbed per test
// so each posture is deterministic.
//
// Window typings (fbq, __bwpGALoaded, __bwpPixelLoaded) come from the global
// declaration in analytics.spec.ts — do not redeclare them here.

function stubGeo(page: Page, body: string, status = 200) {
  return page.route('**/api/geo/', (route) =>
    route.fulfill({ status, contentType: 'application/json', body })
  );
}

test('US visitor with no stored choice: pixel + full analytics load by default', async ({
  page,
}) => {
  await stubGeo(page, JSON.stringify({ country: 'US' }));
  await page.goto('/');
  await page.waitForFunction(() => window.__bwpPixelLoaded === true);
  expect(await page.evaluate(() => window.__bwpGALoaded === true)).toBe(true);
});

test('EEA visitor (DE) with no stored choice: stays opt-in, no pixel', async ({ page }) => {
  await stubGeo(page, JSON.stringify({ country: 'DE' }));
  await page.goto('/');
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => typeof window.fbq)).toBe('undefined');
  expect(await page.evaluate(() => window.__bwpGALoaded === true)).toBe(true);
});

test('geo lookup failure fails closed to opt-in', async ({ page }) => {
  await stubGeo(page, 'oops', 500);
  await page.goto('/');
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => typeof window.fbq)).toBe('undefined');
});

test('stored decline beats the US geo default', async ({ page }) => {
  await stubGeo(page, JSON.stringify({ country: 'US' }));
  await page.addInitScript(() => localStorage.setItem('bwp-cookies-declined', '1'));
  await page.goto('/');
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => typeof window.fbq)).toBe('undefined');
  expect(
    await page.evaluate(
      () => (window as unknown as Record<string, unknown>)['ga-disable-G-REK78NBR14']
    )
  ).toBe(true);
});

test('declining after a US default load is remembered on the next pageview', async ({ page }) => {
  await stubGeo(page, JSON.stringify({ country: 'US' }));
  await page.goto('/');
  await page.waitForFunction(() => window.__bwpPixelLoaded === true);
  await page.getByRole('button', { name: 'Decline' }).click();
  expect(await page.evaluate(() => localStorage.getItem('bwp-cookies-declined'))).toBeTruthy();
  await page.goto('/');
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => window.__bwpPixelLoaded === true)).toBe(false);
});

test('US visitor: template download fires TemplateDownload without Accept', async ({ page }) => {
  await page.route('https://connect.facebook.net/**', (r) => r.abort());
  await page.route('https://www.googletagmanager.com/**', (r) => r.abort());
  await stubGeo(page, JSON.stringify({ country: 'US' }));
  await page.goto('/templates/aia-g702-g703/');
  await page.waitForFunction(() => window.__bwpPixelLoaded === true);
  await page.evaluate(() => {
    document.addEventListener('click', (e) => e.preventDefault(), true);
  });
  await page.locator('a.template-download').first().click();
  const events = await page.evaluate(() => {
    const q = (window.fbq && window.fbq.queue) || [];
    return q.filter((a) => a[0] === 'trackCustom' && a[1] === 'TemplateDownload');
  });
  expect(events.length).toBeGreaterThan(0);
  expect((events[0] as unknown[])[2]).toMatchObject({ template: 'aia-g702-g703' });
});

test('EEA visitor: template download does not load the Pixel', async ({ page }) => {
  await page.route('https://connect.facebook.net/**', (r) => r.abort());
  await stubGeo(page, JSON.stringify({ country: 'DE' }));
  await page.goto('/templates/aia-g702-g703/');
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    document.addEventListener('click', (e) => e.preventDefault(), true);
  });
  await page.locator('a.template-download').first().click();
  expect(await page.evaluate(() => typeof window.fbq)).toBe('undefined');
});
