import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { DemoScript } from "./types.js";
import { buildTimings } from "./narrate.js";
import { renderRemotion } from "./pipeline.js";

// Render smoke test for the composition layer. Generates placeholder clips
// (ffmpeg test pattern) and silent audio for a two-scene split-screen script,
// writes timings.json the same way narrate.ts does, then renders both split
// compositions. No app, no ElevenLabs, no Playwright needed. Output lands in
// output/_smoke/ (gitignored) — look at final.mp4 and final-9x16.mp4.

const SLUG = "_smoke";
const FPS = 30;

function run(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ["ignore", "ignore", "inherit"] });
    child.on("error", reject);
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args[0]} exited ${code}`))));
  });
}

async function main() {
  const outDir = path.resolve("output", SLUG);
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });

  const script = DemoScript.parse({
    slug: SLUG,
    title: "Smoke",
    subtitle: "app.buildworkpro.com/leads",
    layout: "split",
    phone: { theme: "grokbot", name: "Office Bot", subtitle: "Grok Bot · always on", transcriptStatus: "real" },
    intro: { title: "Split-screen smoke", subtitle: "placeholder clips", durationMs: 1500 },
    outro: { title: "Your agents do the work.", cta: "buildworkpro.com/agents", durationMs: 1500 },
    scenes: [
      {
        id: "one",
        title: "Scene one",
        narration: "placeholder",
        caption: { text: "6:40 AM", position: "top" },
        minDurationMs: 4000,
        messages: [
          { from: "agent", text: "Morning. Two GC emails overnight look like real work.", atMs: 600, time: "6:40 AM" },
          { from: "agent", text: "Created two leads, contacts linked.", atMs: 2400, time: "6:41 AM" },
        ],
        actions: [],
      },
      {
        id: "two",
        title: "Scene two",
        narration: "placeholder",
        caption: { text: "Drafted, not sent", position: "bottom" },
        minDurationMs: 4000,
        messages: [
          { from: "you", text: "Draft the walkthrough confirmation.", atMs: 500, time: "7:05 AM" },
          { from: "agent", text: "Draft is in your inbox for review. Logged it on the lead.", atMs: 2200, time: "7:05 AM" },
        ],
        actions: [],
      },
    ],
  });

  for (const scene of script.scenes) {
    const seconds = Math.ceil(scene.minDurationMs / 1000) + 1;
    // Test pattern with a moving timestamp so a frozen frame is obvious.
    await run("ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i", `testsrc2=size=1920x1080:rate=${FPS}`, "-t", String(seconds), "-c:v", "libvpx-vp9", "-b:v", "1M", path.join(outDir, `${scene.id}.webm`)]);
    await run("ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", String(seconds), "-c:a", "libmp3lame", "-q:a", "9", path.join(outDir, `${scene.id}.mp3`)]);
  }

  const timings = buildTimings(
    script,
    script.scenes.map((s) => ({ sceneId: s.id, durationMs: s.minDurationMs - 600 })),
    FPS
  );
  await fs.writeFile(path.join(outDir, "timings.json"), JSON.stringify(timings, null, 2));

  const landscape = await renderRemotion(SLUG, "SplitScreen", "");
  const portrait = await renderRemotion(SLUG, "SplitScreenVertical", "-9x16");
  process.stdout.write("[smoke] done " + JSON.stringify({ landscape, portrait }) + "\n");
}

main().catch((err) => {
  process.stderr.write("[smoke] error: " + (err instanceof Error ? err.message : String(err)) + "\n");
  process.exit(1);
});
