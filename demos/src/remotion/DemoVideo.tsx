import { AbsoluteFill, Audio, OffthreadVideo, Series, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";

// Full-frame composition: one app capture per scene, narration, captions.
// Data comes from input props (the timings.json narrate.ts writes); media is
// resolved with staticFile() against --public-dir=output/<slug>.

export const captionSchema = z.object({ text: z.string(), position: z.enum(["top", "bottom", "center"]).default("bottom") });
export const timingSchema = z.object({
  sceneId: z.string(),
  videoFile: z.string(),
  audioFile: z.string(),
  durationFrames: z.number(),
  still: z.object({ focusX: z.number(), focusY: z.number(), zoom: z.number() }).optional(),
});
export const scriptSchema = z.object({
  slug: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  layout: z.enum(["full", "split"]).optional(),
  phone: z
    .object({ theme: z.enum(["grokbot", "claude", "whatsapp", "terminal"]), name: z.string(), subtitle: z.string().optional(), transcriptStatus: z.enum(["draft", "real"]).optional() })
    .optional(),
  intro: z.object({ title: z.string(), subtitle: z.string().optional(), durationMs: z.number() }).optional(),
  outro: z.object({ title: z.string(), cta: z.string().optional(), durationMs: z.number() }).optional(),
  scenes: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      narration: z.string().optional(),
      caption: captionSchema.optional(),
      messages: z.array(z.object({ from: z.enum(["agent", "you"]), text: z.string(), atMs: z.number(), time: z.string().optional() })).optional(),
    })
  ),
});
export const demoVideoSchema = z.object({ script: scriptSchema, timings: z.array(timingSchema), fps: z.number().optional(), simulation: z.boolean().optional() });
export type DemoVideoProps = z.infer<typeof demoVideoSchema>;
export type Caption = z.infer<typeof captionSchema>;
export type Timing = z.infer<typeof timingSchema>;

export const DemoVideo: React.FC<DemoVideoProps> = ({ script, timings }) => {
  const { fps } = useVideoConfig();

  if (!timings.length) {
    return (
      <AbsoluteFill style={{ background: "#0f172a", color: "white", alignItems: "center", justifyContent: "center", fontSize: 56, fontFamily: "Inter, sans-serif" }}>
        Run capture + narrate first
      </AbsoluteFill>
    );
  }

  const introFrames = Math.ceil(((script.intro?.durationMs ?? 0) / 1000) * fps);
  const outroFrames = Math.ceil(((script.outro?.durationMs ?? 0) / 1000) * fps);

  return (
    <AbsoluteFill style={{ background: "#0b1220" }}>
      <Series>
        {script.intro && (
          <Series.Sequence durationInFrames={introFrames}>
            <TitleCard title={script.intro.title} subtitle={script.intro.subtitle} />
          </Series.Sequence>
        )}
        {timings.map((t) => {
          const scene = script.scenes.find((s) => s.id === t.sceneId);
          return (
            <Series.Sequence key={t.sceneId} durationInFrames={t.durationFrames}>
              <SceneClip timing={t} caption={scene?.caption} />
            </Series.Sequence>
          );
        })}
        {script.outro && (
          <Series.Sequence durationInFrames={outroFrames}>
            <TitleCard title={script.outro.title} subtitle={script.outro.cta} accent />
          </Series.Sequence>
        )}
      </Series>
    </AbsoluteFill>
  );
};

const SceneClip: React.FC<{ timing: Timing; caption?: Caption }> = ({ timing, caption }) => (
  <AbsoluteFill>
    <OffthreadVideo src={staticFile(timing.videoFile)} muted />
    <Audio src={staticFile(timing.audioFile)} />
    {caption && <CaptionOverlay {...caption} />}
  </AbsoluteFill>
);

export const CaptionOverlay: React.FC<Caption & { scale?: number; topPct?: string }> = ({ text, position, scale = 1, topPct = "8%" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 12 } });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [20, 0]);
  const top = position === "top" ? topPct : position === "center" ? "44%" : "auto";
  const bottom = position === "bottom" ? "8%" : "auto";
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top,
          bottom,
          transform: `translate(-50%, ${translateY}px)`,
          opacity,
          background: "rgba(15, 23, 42, 0.82)",
          color: "white",
          padding: `${18 * scale}px ${32 * scale}px`,
          borderRadius: 14 * scale,
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 38 * scale,
          fontWeight: 600,
          letterSpacing: 0.2,
          boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.08)",
          maxWidth: "88%",
          textAlign: "center",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

export const TitleCard: React.FC<{ title: string; subtitle?: string; accent?: boolean; scale?: number }> = ({ title, subtitle, accent, scale = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14 } });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const s = interpolate(enter, [0, 1], [0.96, 1]);
  return (
    <AbsoluteFill
      style={{
        background: accent ? "linear-gradient(135deg, #f97316 0%, #b45309 100%)" : "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        padding: "0 8%",
      }}
    >
      <div style={{ transform: `scale(${s})`, textAlign: "center", color: "white", fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ fontSize: 96 * scale, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.05 }}>{title}</div>
        {subtitle && <div style={{ marginTop: 24 * scale, fontSize: 40 * scale, opacity: 0.85 }}>{subtitle}</div>}
      </div>
    </AbsoluteFill>
  );
};
