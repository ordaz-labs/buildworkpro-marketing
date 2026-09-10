import { test, expect } from '@playwright/test';

// The agents-first positioning (marketing#183): /agents/ replaces
// /features/ai-assistant/, the homepage hero leads with the thesis while the
// title tag keeps the ranking phrase, and every named agent has a docs page.
// Keep selectors structural — copy will keep moving.

test.describe('/agents/ hub', () => {
  test('renders the hero, the crew, and the connect section', async ({ page }) => {
    const response = await page.goto('/agents/');
    expect(response?.status()).toBe(200);
    await expect(page.locator('main h1')).toContainText(/agent/i);
    await expect(page.locator('#crew')).toBeAttached();
    await expect(page.locator('#connect')).toBeAttached();
    for (const name of ['Claude Code', 'ChatGPT', 'Grok Bot', 'OpenClaw', 'Hermes Agent']) {
      await expect(page.locator('#connect')).toContainText(name);
    }
    // The technical term is allowed on this page, but only in the FAQ / safety copy.
    await expect(page.getByText(/Model Context Protocol/i).first()).toBeAttached();
  });

  test('never claims a WhatsApp or SMS inbox for BuildWorkPro or Grok Bot', async ({ page }) => {
    await page.goto('/agents/');
    const text = (await page.locator('main').innerText()).toLowerCase();
    // WhatsApp may only appear next to OpenClaw, which has that channel natively.
    const idx = text.indexOf('whatsapp');
    if (idx !== -1) {
      const window = text.slice(Math.max(0, idx - 200), idx + 200);
      expect(window).toContain('openclaw');
      expect(window).not.toContain('grok bot');
    }
    expect(text).not.toMatch(/buildworkpro (inbox|number)/);
  });

  test('is usable at phone, tablet, and desktop widths', async ({ page }) => {
    for (const width of [375, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/agents/');
      await expect(page.locator('main h1')).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(1);
    }
  });
});

test.describe('homepage', () => {
  test('hero leads with the agents thesis and keeps the ranking phrase in the title', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Construction Project Management Software for Subcontractors/);
    await expect(page.locator('main h1')).toContainText(/keeps the record/i);
    await expect(page.locator('main')).toContainText(
      /Project management software for subcontractors/i
    );
    await expect(page.locator('#crew')).toBeAttached();
  });

  test('Agents is a top-level nav item on desktop and in the mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expect(page.locator('header nav a[href="/agents/"]').first()).toBeVisible();

    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Toggle menu' }).click();
    await expect(page.locator('#mobile-menu a[href="/agents/"]').first()).toBeVisible();
  });
});

test.describe('old URL', () => {
  test('/features/ai-assistant/ redirects to /agents/', async ({ page }) => {
    await page.goto('/features/ai-assistant/');
    await expect(page).toHaveURL(/\/agents\/$/);
    await expect(page.locator('main h1')).toBeVisible();
  });

  test('the features index links to the agents page', async ({ page }) => {
    await page.goto('/features/');
    await expect(page.locator('main a[href="/agents/"]').first()).toBeVisible();
  });
});

test.describe('docs', () => {
  test('every named agent has an install guide', async ({ page }) => {
    for (const slug of [
      'claude-desktop',
      'chatgpt',
      'claude-code',
      'grok-bot',
      'openclaw',
      'hermes-agent',
    ]) {
      const response = await page.goto(`/api/mcp/${slug}/`);
      expect(response?.status(), `/api/mcp/${slug}/ should return 200`).toBe(200);
      await expect(page.locator('h1').first()).toBeVisible();
      await expect(page.locator('main')).toContainText('app.buildworkpro.com/api/mcp');
    }
  });
});
