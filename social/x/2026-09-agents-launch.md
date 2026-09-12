# Agents launch — first two weeks on X

Campaign: `agents-launch`. Landing page: https://buildworkpro.com/agents/ (live since 2026-09-09, PR #186). Every claim below was checked against the app on 2026-09-09; see `README.md` for the rules.

Before the first post (user tasks, marketing#185): claim the brand handle, decide whether the founder account posts, open the X Ads account for the week-3 paid test. Video posts are marked and wait for the real office clip; the simulated preview is never posted.

Legend: **B** = brand account, **F** = founder account. Links use `utm_medium=organic` for B and `utm_medium=founder` for F.

---

## Day 1 · B · thesis thread (3 posts)

Status: draft
Media: the `/agents/` hero as a still (phone chat + pipeline), exported from the live page at 1200×675.

```text
Most construction software added a chatbot in the corner.

We did the opposite. BuildWorkPro is the app your AI agent operates.

Claude, ChatGPT, Grok Bot, OpenClaw, Hermes: connect once, then talk your bids, leads, change orders and pay apps into a real system of record. 🧵
```

```text
How it works: paste one address into your agent and sign in. A consent screen shows every scope the agent asks for; you approve or deny. From then on it creates the bid, the lead, the change order in your account, with your permissions.

You review. You send.
```

```text
Our founder runs a glazing company this way: takeoffs and bids in Claude Code, inbox and calendar through Grok Bot, all of it landing in BuildWorkPro.

Setup guides for every agent: https://buildworkpro.com/agents/?utm_source=x&utm_medium=organic&utm_campaign=agents-launch&utm_content=d1-thesis
```

## Day 2 · F · the office agent (VIDEO, waits for the real clip)

Status: draft — do not post until #184 delivers the real office cut
Media: office clip, 16:9, sound on.

```text
My office agent read the inbox before I woke up.

Two GC emails became two leads in BuildWorkPro, contacts linked, the walkthrough on my calendar, a reply drafted for me to read.

Grok Bot on one side, BuildWorkPro on the other. Nobody typed anything into a CRM.
```

Text-only fallback for week 1 if the clip is not ready:

```text
My office agent reads the inbox before I'm up. Real GC requests become leads in BuildWorkPro with the contact linked, the walkthrough goes on my calendar, and a reply is drafted for me to read.

I review. I send. That part doesn't change.
```

## Day 3 · B · Claude Code how-to

Status: draft
Media: none, or a terminal screenshot of the two commands.

```text
Connect Claude Code to BuildWorkPro in one line:

claude mcp add --transport http buildworkpro https://app.buildworkpro.com/api/mcp

Then /mcp to sign in and approve the scopes. Takeoffs and bids from the terminal, priced from your own catalog.

Guide: https://buildworkpro.com/api/mcp/claude-code/?utm_source=x&utm_medium=organic&utm_campaign=agents-launch&utm_content=d3-claude-code
```

## Day 4 · F · the estimator

Status: draft
Media: none until the estimator clip exists (terminal on the left, bid on the right).

```text
I do takeoffs in Claude Code now.

It reads the drawings with me, we agree on the openings, then it builds the bid in BuildWorkPro from my catalog and my labor rates.

I review the numbers. I send. That part doesn't change.
```

## Day 5 · B · what the agent can actually do

Status: draft
Media: screenshot of the BuildWorkPro consent screen (real one, scopes visible, dangerous ones flagged).

```text
What an agent can do in BuildWorkPro is exactly what it asked for on the consent screen and you approved.

Read scopes only look. Write scopes create and update. Sending a bid or approving a pay app are separate scopes, flagged before you approve.

Revoke any agent in one click.
```

## Day 8 · B · Grok Bot how-to

Status: draft
Media: none.

```text
Grok Bot users: add BuildWorkPro as a custom MCP server

https://app.buildworkpro.com/api/mcp

Sign in, approve, then give the Bot a routine: "every morning, turn new GC emails into leads and tell me what needs a follow-up." It works while you're on site.

Guide: https://buildworkpro.com/api/mcp/grok-bot/?utm_source=x&utm_medium=organic&utm_campaign=agents-launch&utm_content=d8-grok-bot
```

## Day 9 · B · OpenClaw

Status: draft
Media: none.

```text
If you self-host OpenClaw, the MCP servers you already use in Claude Code work there too.

Add BuildWorkPro and your agent runs a subcontracting business from WhatsApp or Telegram: site logs, hours, contacts, change orders.

Guide: https://buildworkpro.com/api/mcp/openclaw/?utm_source=x&utm_medium=organic&utm_campaign=agents-launch&utm_content=d9-openclaw
```

## Day 10 · B · Hermes Agent

Status: draft
Media: none, or a screenshot of the YAML.

```text
Hermes Agent users, four lines in ~/.hermes/config.yaml:

mcp_servers:
  buildworkpro:
    url: https://app.buildworkpro.com/api/mcp
    auth: oauth

Then: hermes mcp login buildworkpro

Guide: https://buildworkpro.com/api/mcp/hermes-agent/?utm_source=x&utm_medium=organic&utm_campaign=agents-launch&utm_content=d10-hermes
```

## Day 11 · F · numbers

Status: draft
Media: none.

```text
National Glass on our own software, since go-live:

400+ bids
3,200+ priced line items
143 projects
1,160 contacts

Most new bids now start as a conversation with an agent. The record is still the record.

https://buildworkpro.com/customers/national-glass/?utm_source=x&utm_medium=founder&utm_campaign=agents-launch&utm_content=d11-numbers
```

## Day 12 · B · opinion

Status: draft
Media: none.

```text
Every "AI in construction" demo shows the AI inside the app.

Real work happens in the truck, the group chat and the inbox. The agent should live there.

The app should be the ledger.
```

## Day 13 · B · under the hood

Status: draft
Media: none.

```text
Under the hood: one MCP server, nearly 300 tools, 11 prompts, OAuth sign-in, scoped to your organization.

Any agent that can add a custom MCP server can run BuildWorkPro.

Docs: https://buildworkpro.com/api/mcp/overview/?utm_source=x&utm_medium=organic&utm_campaign=agents-launch&utm_content=d13-under-the-hood
```

## Day 14 · F · price

Status: draft
Media: none.

```text
No AI add-on. No token bill.

The agent connection is part of the one $79/month plan: unlimited users, 14-day trial, no card. You bring the agent you already pay for.

https://buildworkpro.com/pricing/?utm_source=x&utm_medium=founder&utm_campaign=agents-launch&utm_content=d14-price
```

---

## Reply bank

For the daily 15 minutes under Claude Code, Grok Bot, OpenClaw, and Hermes Agent posts. Facts only, no pitch, link only if someone asks how.

```text
We run a glazing company on this. Claude Code does the takeoff from the drawings, then builds the bid in our own system from the catalog. The MCP server is the whole trick: same connection works in Grok Bot and OpenClaw.
```

```text
The part people miss: the agent needs somewhere to put the work. A CRM row, a bid, a change order. Otherwise it's a chat log. We made our app the thing the agent operates, over MCP.
```

```text
Grok Bot's routines are the reason it's our office agent. "Every morning, read the inbox, make leads out of the real requests." It writes to our system; we read the drafts before anything goes out.
```

## Paid test (week 3, after two weeks organic)

- Budget $10/day for 14 days, objective website traffic, landing page `/agents/`.
- Targeting: US; follower look-alikes of the Claude, OpenAI, Grok, xAI, Nous Research, and OpenClaw accounts; keywords "Claude Code", "Grok Bot", "MCP server", "OpenClaw", "construction estimating", "subcontractor software".
- Creative: the Day 1 opener as a text ad; the real office clip in 9:16 and 16:9 once it exists.
- Links: `utm_medium=paid`, `utm_content=ad-<name>`.
- Success gate: landing-page views under $1 (Meta runs $0.55 to $0.77), at least one signup attributed by day 14.
- No X pixel at launch. Adding one needs the same consent gate and privacy-policy line the Meta pixel required; revisit at week 4.
