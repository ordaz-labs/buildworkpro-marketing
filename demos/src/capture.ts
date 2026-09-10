import fs from "node:fs/promises";
import path from "node:path";
import { chromium, type BrowserContext, type Page } from "playwright";
import { DemoScript, type Action, type Scene } from "./types.js";
import { humanClick, humanType, humanMove, injectCursorOverlay, highlightElement } from "./humanize.js";
import { loadEnv, resolveEnvVars } from "./env.js";

const VIEWPORT = {
  width: Number(process.env.DEMO_WIDTH || 1920),
  height: Number(process.env.DEMO_HEIGHT || 1080),
};

function baseUrl(): string {
  const url = process.env.BWP_DEMO_URL;
  if (!url) throw new Error("BWP_DEMO_URL missing — set it in demos/.env");
  return url.replace(/\/$/, "");
}

async function csrfToken(context: BrowserContext): Promise<string> {
  const res = await context.request.get(`${baseUrl()}/api/auth/csrf-token`);
  if (!res.ok()) throw new Error(`csrf-token failed: ${res.status()}`);
  const json = (await res.json()) as { data?: { csrfToken?: string } };
  const token = json.data?.csrfToken;
  if (!token) throw new Error("csrf-token response had no data.csrfToken");
  return token;
}

/**
 * Sign the capture context in through the JSON API instead of the login
 * form. The form is behind Turnstile, which blocks headless browsers; the
 * API route takes `turnstileToken`, which the server verifies only when a
 * Turnstile secret is configured (local dev usually has the always-pass test
 * secret or none at all). Cookies land on the BrowserContext, so every scene
 * page and every `api` action after this is authenticated.
 */
export async function authenticateContext(context: BrowserContext): Promise<void> {
  const email = process.env.BWP_DEMO_EMAIL;
  const password = process.env.BWP_DEMO_PASSWORD;
  if (!email || !password) {
    process.stderr.write("[capture] BWP_DEMO_EMAIL / BWP_DEMO_PASSWORD not set — scenes will run unauthenticated\n");
    return;
  }
  const base = baseUrl();
  const csrf = await csrfToken(context);
  const login = await context.request.post(`${base}/api/auth/login`, {
    headers: { "x-csrf-token": csrf, "content-type": "application/json" },
    data: { username: email, password, turnstileToken: process.env.BWP_DEMO_TURNSTILE_TOKEN || "demo-capture", rememberMe: false },
  });
  if (!login.ok()) {
    throw new Error(`login failed (${login.status()}): ${(await login.text()).slice(0, 200)} — verify BWP_DEMO_EMAIL / BWP_DEMO_PASSWORD against a seeded account (e.g. rmoreno) and that the local Turnstile secret is the test key or unset`);
  }
  const body = (await login.json()) as { data?: { requiresTwoFactor?: boolean; tenantId?: number; tenants?: Array<{ tenantId: number; tenantName?: string }> } };
  if (body.data?.requiresTwoFactor) throw new Error("demo account has 2FA enabled — use a seeded account without it");

  const wanted = process.env.BWP_DEMO_TENANT_ID ? Number(process.env.BWP_DEMO_TENANT_ID) : undefined;
  const tenantId = wanted ?? body.data?.tenantId ?? body.data?.tenants?.[0]?.tenantId;
  if (!tenantId) throw new Error("login succeeded but no tenant membership came back — set BWP_DEMO_TENANT_ID");
  if (body.data?.tenantId !== tenantId) {
    const sel = await context.request.post(`${base}/api/auth/select-tenant`, {
      headers: { "x-csrf-token": csrf, "content-type": "application/json" },
      data: { tenantId },
    });
    if (!sel.ok()) throw new Error(`select-tenant failed (${sel.status()}): ${(await sel.text()).slice(0, 200)}`);
  }
  process.stdout.write("[capture] authenticated " + JSON.stringify({ email, tenantId }) + "\n");
}

// `${NAME}` inside api bodies resolves from process.env like URLs do; a value
// that is exactly one numeric variable becomes a number so integer ids (contactId,
// projectId) pass the app's validation.
function substitute(value: unknown): unknown {
  if (typeof value === "string") {
    const whole = value.match(/^\$\{([A-Z0-9_]+)\}$/);
    if (whole) {
      const env = process.env[whole[1]];
      if (env !== undefined && /^-?\d+(\.\d+)?$/.test(env)) return Number(env);
      return env ?? "";
    }
    return resolveEnvVars(value);
  }
  if (Array.isArray(value)) return value.map(substitute);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, substitute(v)]));
  }
  return value;
}

async function runApi(context: BrowserContext, action: Extract<Action, { type: "api" }>) {
  const base = baseUrl();
  const csrf = await csrfToken(context);
  const res = await context.request.fetch(`${base}${resolveEnvVars(action.path)}`, {
    method: action.method,
    headers: { "x-csrf-token": csrf, "content-type": "application/json" },
    data: action.body ? substitute(action.body) : undefined,
  });
  const text = await res.text();
  if (!res.ok()) throw new Error(`api ${action.method} ${action.path} failed (${res.status()}): ${text.slice(0, 300)}`);
  if (action.saveAs) {
    let json: unknown = null;
    try {
      json = JSON.parse(text);
    } catch {
      /* non-JSON response, nothing to save */
    }
    const record = (json as { data?: Record<string, unknown> } | null)?.data ?? (json as Record<string, unknown> | null);
    const value = record?.[action.field];
    if (value === undefined) throw new Error(`api ${action.path}: response has no "${action.field}" to save as ${action.saveAs}`);
    process.env[action.saveAs] = String(value);
    process.stdout.write("[capture] api " + JSON.stringify({ path: action.path, saved: { [action.saveAs]: value } }) + "\n");
  }
}

async function smoothScroll(page: Page, action: Extract<Action, { type: "scroll" }>) {
  if (action.selector) {
    const el = await page.waitForSelector(action.selector, { state: "attached" });
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(action.durationMs);
    return;
  }
  const total = action.deltaY ?? 600;
  const steps = Math.max(8, Math.round(action.durationMs / 40));
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, total / steps);
    await page.waitForTimeout(action.durationMs / steps);
  }
}

async function runAction(page: Page, action: Action) {
  switch (action.type) {
    case "navigate":
      await page.goto(resolveEnvVars(action.url), { waitUntil: "domcontentloaded" });
      break;
    case "login": {
      // Kept for scripts that still want the on-screen login. Prefer the API
      // auth that captureScript() runs before the first scene.
      const email = process.env[action.emailEnv];
      const password = process.env[action.passwordEnv];
      if (!email || !password) {
        process.stderr.write("[capture] login env not set — skipping login " + JSON.stringify({ emailEnv: action.emailEnv, passwordEnv: action.passwordEnv }) + "\n");
        break;
      }
      await humanType(page, "#username, input[autocomplete='username'], input[name='username'], input[type='email']", email, 50);
      await humanType(page, "#password, input[type='password']", password, 50);
      await Promise.all([
        page.waitForURL((url) => !/\/login(\?|$)/.test(url.pathname + url.search), { timeout: 15_000 }).catch(() => null),
        humanClick(page, "[data-testid='login-submit'], button[type='submit']"),
      ]);
      if (/\/login(\?|$)/.test(new URL(page.url()).pathname + new URL(page.url()).search)) {
        throw new Error("login failed — still on /login. Verify BWP_DEMO_EMAIL / BWP_DEMO_PASSWORD against a seeded account (e.g. rmoreno).");
      }
      await page.waitForLoadState("domcontentloaded");
      break;
    }
    case "click":
      await humanClick(page, action.selector);
      break;
    case "hover": {
      const h = await page.waitForSelector(action.selector, { state: "visible" });
      const box = await h.boundingBox();
      if (box) await humanMove(page, { x: box.x + box.width / 2, y: box.y + box.height / 2 });
      break;
    }
    case "type":
      await humanType(page, action.selector, action.text, action.delayMs);
      break;
    case "press":
      await page.keyboard.press(action.key);
      break;
    case "wait":
      await page.waitForTimeout(action.ms);
      break;
    case "waitFor":
      await page.waitForSelector(action.selector, { timeout: action.timeoutMs });
      break;
    case "highlight":
      await highlightElement(page, action.selector, action.durationMs);
      break;
    case "scroll":
      await smoothScroll(page, action);
      break;
    case "api":
      await runApi(page.context(), action);
      break;
  }
  if (action.pauseAfterMs) await page.waitForTimeout(action.pauseAfterMs);
}

async function captureScene(context: BrowserContext, scene: Scene, outDir: string): Promise<string> {
  // Each scene gets its own page so Playwright records one video file per scene.
  const page = await context.newPage();
  await injectCursorOverlay(page);
  await page.setViewportSize(VIEWPORT);

  const sceneStart = Date.now();
  try {
    for (const action of scene.actions) {
      await runAction(page, action);
    }
  } catch (err) {
    process.stderr.write("[capture] Scene failed: " + JSON.stringify({ id: scene.id }) + "\n");
    throw err;
  }
  // Hold the final frame so narration can catch up.
  const elapsed = Date.now() - sceneStart;
  if (elapsed < scene.minDurationMs) {
    await page.waitForTimeout(scene.minDurationMs - elapsed);
  }
  await page.close();

  const videoObj = page.video();
  if (!videoObj) throw new Error("Playwright video missing");
  const dest = path.join(outDir, `${scene.id}.webm`);
  await videoObj.saveAs(dest);
  return dest;
}

export async function captureScript(scriptPath: string): Promise<{ outDir: string; sceneVideos: string[] }> {
  loadEnv();
  const raw = JSON.parse(await fs.readFile(scriptPath, "utf8"));
  const script = DemoScript.parse(raw);

  const outDir = path.resolve("output", script.slug);
  await fs.mkdir(outDir, { recursive: true });

  // DEMO_HEADLESS=0 opens a real window. Needed for scenes that paint a PDF
  // preview (blob: iframes stay blank in headless Chromium).
  const headless = process.env.DEMO_HEADLESS !== "0";
  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    recordVideo: { dir: outDir, size: VIEWPORT },
  });

  const sceneVideos: string[] = [];
  try {
    await authenticateContext(context);
    for (const scene of script.scenes) {
      process.stdout.write("[capture] " + JSON.stringify({ id: scene.id, title: scene.title }) + "\n");
      sceneVideos.push(await captureScene(context, scene, outDir));
    }
  } finally {
    await context.close();
    await browser.close();
  }

  return { outDir, sceneVideos };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const scriptArg = process.argv[2];
  if (!scriptArg) {
    console.error("Usage: tsx src/capture.ts <script.json>");
    process.exit(1);
  }
  captureScript(scriptArg)
    .then(({ outDir }) => {
      process.stdout.write("[capture] done " + JSON.stringify({ outDir }) + "\n");
    })
    .catch((err) => {
      process.stderr.write("[capture] error: " + (err instanceof Error ? err.message : String(err)) + "\n");
      process.exit(1);
    });
}
