# BuildWorkPro Demos

Programmatic marketing-video pipeline. One JSON script → captured app footage → AI narration → finished MP4.

```
scripts/*.json          # Demo script (scenes, actions, narration)
   │
   ├─► capture.ts       # Playwright drives the app, records each scene
   │       └── output/<slug>/scene-N.webm
   │
   ├─► narrate.ts       # ElevenLabs TTS, one mp3 per scene
   │       └── output/<slug>/scene-N.mp3
   │
   └─► remotion render  # Composes scene clips + audio + captions
           └── output/<slug>/final.mp4
```

## Setup

```bash
cd demos
npm install
npx playwright install chromium
cp .env.example .env       # fill in ELEVENLABS_API_KEY, demo creds
```

## Run

```bash
npm run build -- scripts/01-create-contact.json     # full pipeline
npm run capture -- scripts/01-create-contact.json   # just record
npm run narrate -- scripts/01-create-contact.json   # just TTS
npm run studio                                       # interactive Remotion editor
```

## Adding a new demo

1. Copy `scripts/01-create-contact.json` to `scripts/02-<your-demo>.json`.
2. Edit `scenes[]`: each scene has `actions` (Playwright steps) and a `narration` line.
3. `npm run build -- scripts/02-<your-demo>.json`.

## Split-screen agent clips

"The agent on a phone, BuildWorkPro on the desk." A script with `"layout": "split"` renders two cuts — `final.mp4` (16:9, phone left / app right) and `final-9x16.mp4` (portrait, phone top / app bottom) — from the same scenes. See `scripts/04-office.json`.

```jsonc
{
  "layout": "split",
  "phone": { "theme": "grokbot", "name": "Office Bot", "subtitle": "Grok Bot · always on", "transcriptStatus": "draft" },
  "scenes": [{
    "id": "two-leads",
    "narration": "...",
    "messages": [{ "from": "agent", "text": "Created leads for ...", "atMs": 1500, "time": "6:41 AM" }],
    "actions": [
      { "type": "api", "method": "POST", "path": "/api/leads", "body": { "name": "...", "contactId": "${OFFICE_CONTACT_A}" }, "saveAs": "OFFICE_LEAD_A" },
      { "type": "navigate", "url": "${BWP_DEMO_URL}/leads/${OFFICE_LEAD_A}" }
    ]
  }]
}
```

- **`phone`** picks the chrome (`grokbot`, `claude`, `whatsapp`, `terminal`) — colors only, no third-party logos. `messages[]` bubbles appear at `atMs` offsets inside the scene; agent bubbles get a short typing indicator first.
- **`api` actions** create the records the agent "made" through the same REST surface the MCP tools write through, using the capture session's cookies + CSRF token. `saveAs` stores the response `id` (or `field`) so later actions and bodies can use `${NAME}`; a body value that is exactly `${NAME}` becomes a number when the saved value is numeric.
- **`scroll`** actions smooth-scroll by `deltaY` or to a `selector`.
- **Transcript rule.** The phone side is a claim about what the agent said. Keep `transcriptStatus: "draft"` while timing a rough cut (render with `DEMO_ALLOW_DRAFT_TRANSCRIPT=1`); before a public cut, run the real flow through the agent, keep the transcript, re-typeset it into `messages[]`, and set `"real"`. The pipeline refuses to render a draft otherwise.
- **`DEMO_ASPECT=16x9` or `9x16`** renders one cut while iterating.

## Auth, headless, and props

- Capture signs in through the JSON API (`/api/auth/csrf-token` → `/api/auth/login` with `turnstileToken` → `/api/auth/select-tenant`), not the login form: the form is behind Turnstile, which blocks headless browsers. Set `BWP_DEMO_EMAIL` / `BWP_DEMO_PASSWORD` to a seeded account (e.g. `rmoreno`) and, with more than one membership, `BWP_DEMO_TENANT_ID`. Local dev needs the Turnstile test secret or none configured.
- `DEMO_HEADLESS=0` opens a real window. PDF preview scenes need it (blob: iframes stay blank headless).
- Remotion reads everything from `--props=output/<slug>/timings.json` and resolves clips/audio with `staticFile()` against `--public-dir=output/<slug>`; the compositions never touch the filesystem. `npm run render:smoke` renders both split compositions from generated placeholder clips so the composition layer can be checked without the app running.

## Voice

Default voice is the ElevenLabs "Adam" pre-made voice. To use a cloned brand voice:

1. Clone your voice in the ElevenLabs UI (6+ seconds of clean audio).
2. Copy the voice_id into `.env` as `ELEVENLABS_VOICE_ID`.

## Outputs

- `final.mp4` — the marketing video (1080p, 30fps by default).
- `transcript.txt` — concatenated narration text for YouTube descriptions, blog posts, captions.
- Per-scene `.webm` and `.mp3` files for inspection or re-editing.
