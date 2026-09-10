import { z } from "zod";

const ActionBase = z.object({
  comment: z.string().optional(),
  pauseAfterMs: z.number().int().min(0).max(10_000).optional(),
});

export const Action = z.discriminatedUnion("type", [
  ActionBase.extend({ type: z.literal("navigate"), url: z.string() }),
  ActionBase.extend({ type: z.literal("login"), emailEnv: z.string().default("BWP_DEMO_EMAIL"), passwordEnv: z.string().default("BWP_DEMO_PASSWORD") }),
  ActionBase.extend({ type: z.literal("click"), selector: z.string() }),
  ActionBase.extend({ type: z.literal("hover"), selector: z.string() }),
  ActionBase.extend({ type: z.literal("type"), selector: z.string(), text: z.string(), delayMs: z.number().int().min(0).max(500).default(60) }),
  ActionBase.extend({ type: z.literal("press"), key: z.string() }),
  ActionBase.extend({ type: z.literal("wait"), ms: z.number().int().min(0).max(15_000) }),
  ActionBase.extend({ type: z.literal("waitFor"), selector: z.string(), timeoutMs: z.number().int().min(0).max(30_000).default(10_000) }),
  ActionBase.extend({ type: z.literal("highlight"), selector: z.string(), durationMs: z.number().int().min(300).max(5_000).default(1200) }),
  // Smooth scroll by a pixel delta (positive = down), or to a selector.
  ActionBase.extend({ type: z.literal("scroll"), deltaY: z.number().int().optional(), selector: z.string().optional(), durationMs: z.number().int().min(100).max(5_000).default(900) }),
  // Authenticated JSON call against the app, using the capture session's
  // cookies + CSRF token. `saveAs` stores `<field>` of the response `data`
  // (default: id) in process.env so later actions can reference `${NAME}`.
  // This is how the app side of a split-screen clip gets the records the
  // agent "created": the same REST surface the MCP tools write through.
  ActionBase.extend({
    type: z.literal("api"),
    method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).default("POST"),
    path: z.string(),
    body: z.record(z.unknown()).optional(),
    saveAs: z.string().regex(/^[A-Z0-9_]+$/).optional(),
    field: z.string().default("id"),
  }),
]);
export type Action = z.infer<typeof Action>;

export const Caption = z.object({
  text: z.string(),
  position: z.enum(["bottom", "top", "center"]).default("bottom"),
});

// One chat bubble on the phone side of a split-screen scene. `atMs` is the
// offset from the start of the scene at which the bubble appears; bubbles
// before it stay visible. Agent bubbles get a short typing indicator first.
export const PhoneMessage = z.object({
  from: z.enum(["agent", "you"]),
  text: z.string().min(1),
  atMs: z.number().int().min(0),
  time: z.string().optional(),
});
export type PhoneMessage = z.infer<typeof PhoneMessage>;

export const Scene = z.object({
  id: z.string(),
  title: z.string(),
  narration: z.string(),
  caption: Caption.optional(),
  actions: z.array(Action),
  minDurationMs: z.number().int().min(1000).default(4000),
  messages: z.array(PhoneMessage).optional(),
});
export type Scene = z.infer<typeof Scene>;

// Phone-side identity for a split-screen script. The theme only changes
// chrome colors; the words come from a real transcript (see transcriptStatus).
export const PhoneConfig = z.object({
  theme: z.enum(["grokbot", "claude", "whatsapp", "terminal"]).default("grokbot"),
  name: z.string(),
  subtitle: z.string().optional(),
  // "draft" = placeholder lines written for timing; "real" = re-typeset from a
  // recorded transcript. The pipeline refuses to render a public cut of a draft
  // unless DEMO_ALLOW_DRAFT_TRANSCRIPT=1 — see pipeline.ts.
  transcriptStatus: z.enum(["draft", "real"]).default("draft"),
});
export type PhoneConfig = z.infer<typeof PhoneConfig>;

export const DemoScript = z.object({
  slug: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  layout: z.enum(["full", "split"]).default("full"),
  phone: PhoneConfig.optional(),
  intro: z.object({ title: z.string(), subtitle: z.string().optional(), durationMs: z.number().int().default(2500) }).optional(),
  outro: z.object({ title: z.string(), cta: z.string().optional(), durationMs: z.number().int().default(2500) }).optional(),
  scenes: z.array(Scene).min(1),
}).superRefine((s, ctx) => {
  if (s.layout === "split" && !s.phone) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "layout 'split' requires a `phone` block", path: ["phone"] });
  }
});
export type DemoScript = z.infer<typeof DemoScript>;

export type SceneTiming = {
  sceneId: string;
  // Basenames inside output/<slug>/ — the Remotion side resolves them with
  // staticFile() against --public-dir, never with file:// paths.
  videoFile: string;
  audioFile: string;
  durationFrames: number;
};

// What narrate.ts writes to output/<slug>/timings.json and what Remotion reads
// through --props. Keeping the script inside means the composition needs no
// filesystem access at all (Remotion bundles for the browser).
export type TimingsFile = {
  script: DemoScript;
  timings: SceneTiming[];
  fps: number;
};
