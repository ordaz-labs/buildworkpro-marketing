import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import {
  sendEmail,
  verifyTurnstile,
  sanitizeField,
  isValidEmail,
  buildHtmlTable,
} from '../../lib/email';
import { checkRateLimit, type RateLimiter } from '../../lib/rate-limit';
import { TEMPLATE_LIST, type TemplateEntry } from '../../data/templates';

export const prerender = false;

// The complete template pack (issue #145 / backlog #601). Files live in
// public/templates-files/ and are open downloads by design — this email is a
// convenience bundle, not a gate. The list is derived from the template
// registry (src/data/templates.ts) so it can never drift from the hub.
const SITE = 'https://buildworkpro.com';

const EXT: Record<TemplateEntry['formats'][number], string> = {
  PDF: 'pdf',
  Excel: 'xlsx',
  Word: 'docx',
};

const PACK = TEMPLATE_LIST.map((t) => ({
  title: t.title,
  page: `${SITE}/templates/${t.slug}/`,
  files: t.formats.map((f) => ({
    label: f,
    url: `${SITE}/templates-files/${t.basename}.${EXT[f]}`,
  })),
}));

// Static content only — no user input is interpolated into the visitor email.
function buildPackEmail(): string {
  const items = PACK.map(
    (t) =>
      `<li style="margin:0 0 12px"><a href="${t.page}" style="color:#2563eb;font-weight:600">${t.title}</a><br><span style="font-size:13px;color:#475569">${t.files
        .map((f) => `<a href="${f.url}" style="color:#2563eb">${f.label}</a>`)
        .join(' · ')}</span></li>`
  ).join('');
  return `
    <div style="font-family:sans-serif;font-size:15px;color:#0f172a;line-height:1.6;max-width:560px">
      <h2 style="font-size:20px">Your free construction templates</h2>
      <p>Here's the complete BuildWorkPro template pack — ${PACK.length} templates, every file a direct download, ready to use. This is a one-time email, not a newsletter:</p>
      <ul style="padding-left:20px">${items}</ul>
      <p>Each template page has a fill-out guide, a completed example and the FAQ at
        <a href="${SITE}/templates/" style="color:#2563eb">buildworkpro.com/templates</a>.</p>
      <p style="margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;color:#475569;font-size:13px">
        Filling these out by hand every month? BuildWorkPro generates bids, pay applications,
        change orders, invoices and daily reports from your project data — $79/month flat, unlimited users.
        <a href="${SITE}/" style="color:#2563eb">Take a look</a>.
      </p>
    </div>
  `;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const apiKey = (env as any).SENDGRID_API_KEY as string;
    const turnstileSecret = (env as any).TURNSTILE_SECRET_KEY as string;

    let body: Record<string, string>;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const turnstileToken = body['cf-turnstile-response'];
    if (!turnstileToken) {
      return Response.json({ error: 'Verification required.' }, { status: 400 });
    }

    const ip = request.headers.get('CF-Connecting-IP') || undefined;
    const valid = await verifyTurnstile(turnstileSecret, turnstileToken, ip);
    if (!valid) {
      return Response.json({ error: 'Verification failed. Please try again.' }, { status: 403 });
    }

    const email = sanitizeField('email', body.email);
    if (!email || !isValidEmail(email)) {
      return Response.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    // App-level rate limit (belt-and-suspenders behind Turnstile + WAF). No-op
    // when the RATE_LIMITER binding is absent, e.g. local dev — see rate-limit.ts.
    const limiter = (env as any).RATE_LIMITER as RateLimiter | undefined;
    const allowed = await checkRateLimit(limiter, [
      `template-pack:ip:${ip ?? 'unknown'}`,
      `template-pack:email:${email.toLowerCase()}`,
    ]);
    if (!allowed) {
      return Response.json(
        { error: 'Too many requests. Please wait a minute and try again.' },
        { status: 429 }
      );
    }

    await sendEmail(apiKey, {
      subject: 'Your free construction template pack',
      htmlContent: buildPackEmail(),
      to: { email },
    });

    // Internal lead notification. Never fail the visitor's request over it.
    try {
      await sendEmail(apiKey, {
        subject: `Template pack requested: ${email}`,
        htmlContent: `
          <h2>Template pack requested</h2>
          ${buildHtmlTable({ Email: email, Source: '/templates/ complete-pack form' })}
        `,
        replyTo: { email },
      });
    } catch (err) {
      console.error('Template pack lead notification failed:', err);
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('Template pack error:', err);
    return Response.json({ error: 'Failed to send the pack. Please try again.' }, { status: 500 });
  }
};
