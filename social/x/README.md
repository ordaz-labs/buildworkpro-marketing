# X (Twitter) drafts

Post drafts for the BuildWorkPro X presence. Nothing in this folder is published by tooling: drafts land here through a PR, a human reviews, and a human posts (Typefully or Buffer for scheduling; the X API posting tier is not worth paying for yet).

Tracked in marketing#185. Strategy, pillars, and the paid test live in the agents brainstorm deck linked from that issue.

## Files

- `README.md` — this file: rules, conventions, cadence.
- `YYYY-MM-<campaign>.md` — one file per campaign or fortnight. Each post is a fenced `text` block so `scripts/x-count.mjs` (see below) can count characters.

## Rules that never bend

1. **Every product claim traces to the site or the docs.** The same rule as the marketing pages: `src/content/docs/` and the live MCP surface are the source of truth. Nothing "it can probably do."
2. **Consent-screen wording.** The screen shows every scope an agent requests and the user approves or denies that set; the approval scopes are flagged. There is no per-scope picker, so never write "read-only by default," "grant only the scopes you want," or "pick which scopes." Say: "what it asked for and you approved."
3. **"You review, you send."** Sending a bid, approving a pay app, and approving a change order are separate scopes. An agent only has them if they were in the request the user approved.
4. **No activity-feed parity claim** until buildworkpro#994 ships. MCP writes for leads, contacts, site logs, time entries, change orders, projects, and pay apps do not log activity today.
5. **Numbers only from the customer page.** 400+ bids, 3,200+ priced line items, 143 projects, 1,160 contacts. No other stats, no invented customers or testimonials.
6. **Agent names as text.** No third-party logos in images. Name them: Claude, Claude Code, ChatGPT, Grok Bot, OpenClaw, Hermes Agent. Meta Muse only as "we're testing it."
7. **Office role is email and calendar.** Through Grok Bot's own connectors. WhatsApp and SMS appear only next to OpenClaw, which has that channel natively. The founder's own SMS/WhatsApp bridge is custom and stays off X.
8. **The simulated office clip is never posted.** It carries a "simulated preview" badge for a reason. Video posts wait for the real cut (#184).
9. **Pricing:** $79/month flat, $790/year, unlimited users, 14-day trial, no credit card. No AI add-on.

## Links and attribution

Every link carries UTMs so GA4 (cookieless by default) attributes the session and the signup CTA keeps the params through to the app:

```
?utm_source=x&utm_medium=<organic|founder|paid>&utm_campaign=<campaign>&utm_content=<post-slug>
```

- `organic` = brand account, `founder` = Ivan's personal account, `paid` = X Ads.
- Link targets are the live pages only: `/agents/`, `/api/mcp/<agent>/`, `/customers/national-glass/`, `/pricing/`.
- X shortens every URL to 23 characters when counting; `scripts/x-count.mjs` reports both raw and X-adjusted counts. Keep every post at or under 280 adjusted characters unless the account has Premium and the post is marked `long`.

## Cadence

- Brand account: one post per weekday.
- Founder account: three per week, first-person, no marketing voice.
- One video per week once the real clips exist.
- Replies: 15 minutes a day under Claude Code, Grok Bot, OpenClaw, and Hermes posts, with the real workflow and no pitch. This is where the first hundred followers come from.

## Workflow

1. Draft here (a person or the Tue/Fri content routine — see the note below).
2. Run `node scripts/x-count.mjs social/x/<file>.md` and fix anything over the limit.
3. Open a PR. Review for the rules above and the claims.
4. After merge, schedule in Typefully/Buffer. Mark posted items with the date in the `Status` line so the file doubles as the log.

### Extending the content routine

The Tue/Fri cloud routine that drafts blog posts can also draft a week of X posts into this folder as part of its PR. Instruction to add to that routine, verbatim:

> Also draft five brand posts and three founder posts for X into `social/x/YYYY-MM-<theme>.md`, following `social/x/README.md` exactly: every claim traced to `src/content/docs/` or the live site, consent-screen wording as specified, UTMs on every link, each post as a fenced `text` block with a `Status: draft` line. Run `node scripts/x-count.mjs` on the file and keep every post at or under 280 adjusted characters.
