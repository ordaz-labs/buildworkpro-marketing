import { AbsoluteFill, Audio, OffthreadVideo, Series, staticFile, useVideoConfig } from "remotion";
import { z } from "zod";
import { CaptionOverlay, TitleCard, demoVideoSchema, type Timing } from "./DemoVideo";
import { PhoneChat } from "./PhoneChat";

// "Agent on a phone, BuildWorkPro on the desk." Left/top: the phone chat for
// the scene, bubbles appearing at their atMs offsets. Right/bottom: the real
// app capture for the same scene. One narration track, one caption, and the
// brand frame around both. Landscape (1920x1080) and portrait (1080x1920)
// share this component; orientation only changes the layout math.

export const splitScreenSchema = demoVideoSchema.extend({ orientation: z.enum(["landscape", "portrait"]).default("landscape") });
export type SplitScreenProps = z.infer<typeof splitScreenSchema>;

export const SplitScreen: React.FC<SplitScreenProps> = ({ script, timings, orientation }) => {
  const { fps, width, height } = useVideoConfig();
  const portrait = orientation === "portrait";
  const scale = portrait ? 0.62 : 1;

  if (!timings.length || !script.phone) {
    return (
      <AbsoluteFill style={{ background: "#0f172a", color: "white", alignItems: "center", justifyContent: "center", fontSize: 48, fontFamily: "Inter, sans-serif", textAlign: "center", padding: "0 10%" }}>
        {script.phone ? "Run capture + narrate first" : "This script has no `phone` block — use the DemoVideo composition"}
      </AbsoluteFill>
    );
  }
  const phone = script.phone;
  const introFrames = Math.ceil(((script.intro?.durationMs ?? 0) / 1000) * fps);
  const outroFrames = Math.ceil(((script.outro?.durationMs ?? 0) / 1000) * fps);

  // Layout: a brand-navy stage with the app window taking most of the frame
  // and the phone overlapping its leading edge, like the site hero.
  const pad = Math.round(width * 0.03);
  const phoneWidth = portrait ? Math.round(width * 0.42) : Math.round(height * 0.34);
  const appWidth = portrait ? width - pad * 2 : Math.round(width * 0.72);
  const appHeight = Math.round((appWidth * 9) / 16);

  return (
    <AbsoluteFill style={{ background: "linear-gradient(160deg, #0f172a 0%, #111c33 55%, #0b1220 100%)", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Series>
        {script.intro && (
          <Series.Sequence durationInFrames={introFrames}>
            <TitleCard title={script.intro.title} subtitle={script.intro.subtitle} scale={scale} />
          </Series.Sequence>
        )}
        {timings.map((t) => {
          const scene = script.scenes.find((s) => s.id === t.sceneId);
          return (
            <Series.Sequence key={t.sceneId} durationInFrames={t.durationFrames}>
              <AbsoluteFill>
                <Audio src={staticFile(t.audioFile)} />
                {portrait ? (
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: pad }}>
                    <PhoneChat phone={phone} messages={scene?.messages ?? []} width={phoneWidth} fps={fps} />
                    <AppWindow timing={t} width={appWidth} height={appHeight} url={script.subtitle} />
                  </div>
                ) : (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ position: "relative", width: appWidth + phoneWidth * 0.55, height: Math.max(appHeight, phoneWidth * (19.5 / 9)) }}>
                      <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }}>
                        <AppWindow timing={t} width={appWidth} height={appHeight} url={script.subtitle} />
                      </div>
                      <div style={{ position: "absolute", left: 0, bottom: 0 }}>
                        <PhoneChat phone={phone} messages={scene?.messages ?? []} width={phoneWidth} fps={fps} />
                      </div>
                    </div>
                  </div>
                )}
                {/* Top captions sit above the app window's chrome bar, not on it. */}
                {scene?.caption && <CaptionOverlay {...scene.caption} scale={scale} topPct={portrait ? "4%" : "2.5%"} />}
              </AbsoluteFill>
            </Series.Sequence>
          );
        })}
        {script.outro && (
          <Series.Sequence durationInFrames={outroFrames}>
            <TitleCard title={script.outro.title} subtitle={script.outro.cta} accent scale={scale} />
          </Series.Sequence>
        )}
      </Series>
    </AbsoluteFill>
  );
};

const AppWindow: React.FC<{ timing: Timing; width: number; height: number; url?: string }> = ({ timing, width, height, url }) => {
  const bar = Math.round(width * 0.022);
  return (
    <div style={{ width, borderRadius: Math.round(width * 0.012), overflow: "hidden", background: "#0f172a", boxShadow: "0 40px 90px rgba(2, 6, 23, 0.55)", border: "1px solid rgba(148, 163, 184, 0.25)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: bar * 0.4, padding: `${bar * 0.5}px ${bar * 0.8}px`, background: "#1e293b" }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: bar * 0.55, height: bar * 0.55, borderRadius: "50%", background: "#475569", display: "block" }} />
        ))}
        <div style={{ flex: 1, marginLeft: bar * 0.6, background: "#334155", color: "#94a3b8", fontSize: bar * 0.62, borderRadius: bar * 0.3, padding: `${bar * 0.18}px ${bar * 0.6}px`, textAlign: "center" }}>
          {url ?? "app.buildworkpro.com"}
        </div>
      </div>
      <div style={{ width, height, background: "#0b1220" }}>
        <OffthreadVideo src={staticFile(timing.videoFile)} muted style={{ width, height, objectFit: "cover", objectPosition: "top left", display: "block" }} />
      </div>
    </div>
  );
};
