import { test, expect, type Page } from '@playwright/test';
import { TEMPLATE_LIST } from '../src/data/templates';
import { NEXT_STEPS } from '../src/data/template-next-steps';

// Post-download "next step" panel on template pages (Layout.astro reveals
// #template-next-step from the template_download listener). The download is
// never gated: the panel is hidden until a file is already on its way.

const SIGNUP_ORIGIN = 'https://app.buildworkpro.com/signup';

declare global {
  interface Window {
    dataLayer: unknown[][];
  }
}

test.beforeEach(async ({ page }) => {
  await page.route('https://connect.facebook.net/**', (r) => r.abort());
  await page.route('https://www.googletagmanager.com/**', (r) => r.abort());
});

function gaEvents(page: Page, name: string) {
  return page.evaluate(
    (n) => (window.dataLayer || []).filter((d) => d[0] === 'event' && d[1] === n),
    name
  );
}

// Keep the page (and its tracker state) alive through link clicks; the
// bubble-phase listeners in Layout.astro still run.
async function cancelNavigation(page: Page) {
  await page.evaluate(() => {
    document.addEventListener('click', (e) => e.preventDefault(), true);
  });
}

test('every registered template has a next-step line', () => {
  for (const t of TEMPLATE_LIST) {
    const line = NEXT_STEPS[t.slug as keyof typeof NEXT_STEPS];
    expect(line, t.slug).toBeTruthy();
    expect(line.length, t.slug).toBeLessThanOrEqual(200);
  }
});

test.describe('template next-step panel', () => {
  test('stays hidden until a download starts, then shows the trial CTA', async ({ page }) => {
    await page.goto('/templates/change-order/');
    const panel = page.locator('#template-next-step');
    await expect(panel).toBeHidden();
    // The downloads stay directly usable — nothing in front of them.
    await expect(page.locator('main a.template-download').first()).toBeVisible();

    await cancelNavigation(page);
    await page.locator('main a.template-download').first().click();

    await expect(panel).toBeVisible();
    await expect(panel).toContainText(NEXT_STEPS['change-order']);
    const trial = panel.locator('a[data-next-step="trial"]');
    expect(await trial.getAttribute('href')).toMatch(new RegExp(`^${SIGNUP_ORIGIN}`));
    // No free tool for change orders, so the softer link is the feature page.
    await expect(panel.locator('a[data-next-step="feature"]')).toHaveAttribute(
      'href',
      '/features/change-orders/'
    );
  });

  test('prefers the free online tool as the softer link when one exists', async ({ page }) => {
    await page.goto('/templates/aia-g702-g703/');
    await cancelNavigation(page);
    await page.locator('main a.template-download').first().click();

    await expect(page.locator('#template-next-step a[data-next-step="tool"]')).toHaveAttribute(
      'href',
      '/tools/pay-app/'
    );
  });

  test('reports a view once per page and a click with its target', async ({ page }) => {
    await page.goto('/templates/aia-g702-g703/');
    await cancelNavigation(page);
    const downloads = page.locator('main a.template-download');
    await downloads.nth(0).click();
    await downloads.nth(1).click();

    const views = await gaEvents(page, 'template_next_step_view');
    expect(views).toHaveLength(1);
    expect((views[0] as unknown[])[2]).toMatchObject({ template: 'aia-g702-g703' });

    await page.locator('#template-next-step a[data-next-step="trial"]').click();
    const clicks = await gaEvents(page, 'template_next_step_click');
    expect((clicks[0] as unknown[])[2]).toMatchObject({
      template: 'aia-g702-g703',
      target: 'trial',
    });
    // It is a signup CTA, so the primary conversion event fires as well.
    expect((await gaEvents(page, 'start_trial')).length).toBeGreaterThan(0);
  });

  test('the trial link carries organic attribution like every other CTA', async ({ page }) => {
    await page.goto('/templates/scope-of-work/', { referer: 'https://www.google.com/' });
    const href = await page
      .locator('#template-next-step a[data-next-step="trial"]')
      .getAttribute('href');
    expect(Object.fromEntries(new URL(href!).searchParams)).toMatchObject({
      utm_source: 'google',
      utm_medium: 'organic',
      landing_page: '/templates/scope-of-work/',
    });
  });
});
