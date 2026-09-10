import { Composition } from "remotion";
import { DemoVideo, demoVideoSchema, type DemoVideoProps } from "./DemoVideo";
import { SplitScreen, splitScreenSchema, type SplitScreenProps } from "./SplitScreen";

// Remotion bundles this file for the browser, so nothing here may touch the
// filesystem. All data arrives through input props: the pipeline renders with
//   --props=output/<slug>/timings.json --public-dir=output/<slug>
// and the compositions resolve clips/audio with staticFile(basename).
// calculateMetadata derives the duration from those props, so a cold
// `remotion studio` with no props still mounts with a placeholder.

const DEFAULT_FPS = 30;

function totalFrames(props: { timings?: Array<{ durationFrames: number }>; script?: { intro?: { durationMs: number }; outro?: { durationMs: number } }; fps?: number }) {
  const fps = props.fps ?? DEFAULT_FPS;
  const scenes = (props.timings ?? []).reduce((acc, t) => acc + t.durationFrames, 0);
  const intro = Math.ceil(((props.script?.intro?.durationMs ?? 0) / 1000) * fps);
  const outro = Math.ceil(((props.script?.outro?.durationMs ?? 0) / 1000) * fps);
  return Math.max(scenes + intro + outro, fps);
}

const placeholder = { fps: DEFAULT_FPS, timings: [], script: { slug: "demo", title: "Run capture + narrate first", layout: "full" as const, scenes: [] } };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DemoVideo"
        component={DemoVideo}
        schema={demoVideoSchema}
        defaultProps={placeholder as DemoVideoProps}
        fps={DEFAULT_FPS}
        width={1920}
        height={1080}
        durationInFrames={DEFAULT_FPS * 5}
        calculateMetadata={({ props }) => ({ durationInFrames: totalFrames(props), fps: props.fps ?? DEFAULT_FPS })}
      />
      {/* Phone left, app right. 16:9 for the site, YouTube, X landscape. */}
      <Composition
        id="SplitScreen"
        component={SplitScreen}
        schema={splitScreenSchema}
        defaultProps={{ ...placeholder, orientation: "landscape" } as SplitScreenProps}
        fps={DEFAULT_FPS}
        width={1920}
        height={1080}
        durationInFrames={DEFAULT_FPS * 5}
        calculateMetadata={({ props }) => ({ durationInFrames: totalFrames(props), fps: props.fps ?? DEFAULT_FPS })}
      />
      {/* Phone top, app bottom. 9:16 for Reels, Stories, X vertical. */}
      <Composition
        id="SplitScreenVertical"
        component={SplitScreen}
        schema={splitScreenSchema}
        defaultProps={{ ...placeholder, orientation: "portrait" } as SplitScreenProps}
        fps={DEFAULT_FPS}
        width={1080}
        height={1920}
        durationInFrames={DEFAULT_FPS * 5}
        calculateMetadata={({ props }) => ({ durationInFrames: totalFrames(props), fps: props.fps ?? DEFAULT_FPS })}
      />
    </>
  );
};
