import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { DemoScript, type TimingsFile } from "./types.js";
import { narrateScript, buildTimings } from "./narrate.js";
import { renderRemotion } from "./pipeline.js";
import { loadEnv } from "./env.js";

// Simulated split-screen cut: every scene's app side is a real screenshot
// (scene.still) with a slow push-in instead of a Playwright recording, so the
// clip can be reviewed before the app is running or the agent transcript is
// final. Narration goes through ElevenLabs when a key is set; otherwise the
// scenes get silent audio and run for their minDurationMs. The render carries
// a "simulated preview" badge — this is for review, never for publishing.
//
//   npx tsx src/simulate.ts scripts/04-office-sim.json

function run(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ["ignore", "ignore", "inherit"] });
    child.on("error", reject);
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

async function silentAudio(outDir: string, sceneId: string, seconds: number) {
  await run("ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", String(seconds), "-c:a", "libmp3lame", "-q:a", "9", path.join(outDir, `${sceneId}.mp3`)]);
}

async function main() {
  loadEnv();
  const scriptArg = process.argv[2];
  if (!scriptArg) {
    process.stderr.write("Usage: tsx src/simulate.ts <script.json>\n");
    process.exit(1);
  }
  const raw = JSON.parse(await fs.readFile(scriptArg, "utf8"));
  const script = DemoScript.parse(raw);
  if (script.layout !== "split") throw new Error("simulate.ts expects a split-screen script");
  const missing = script.scenes.filter((s) => !s.still).map((s) => s.id);
  if (missing.length) throw new Error(`every scene needs a \`still\` for a simulation; missing: ${missing.join(", ")}`);

  const fps = Number(process.env.DEMO_FPS || 30);
  const outDir = path.resolve("output", script.slug);
  await fs.mkdir(outDir, { recursive: true });

  // 1) Stills → output/<slug>/<sceneId>.<ext>
  const stillFiles = new Map<string, string>();
  for (const scene of script.scenes) {
    const src = path.resolve(scene.still!.src);
    const ext = path.extname(src).toLowerCase() || ".png";
    const dest = `${scene.id}${ext}`;
    await fs.copyFile(src, path.join(outDir, dest));
    stillFiles.set(scene.id, dest);
  }

  // 2) Narration: ElevenLabs if possible, silence otherwise.
  let timings: TimingsFile;
  try {
    if (!process.env.ELEVENLABS_API_KEY) throw new Error("no ELEVENLABS_API_KEY");
    await narrateScript(scriptArg);
    timings = JSON.parse(await fs.readFile(path.join(outDir, "timings.json"), "utf8")) as TimingsFile;
    process.stdout.write("[simulate] narration: ElevenLabs\n");
  } catch (err) {
    process.stderr.write("[simulate] narration unavailable, using silence: " + (err instanceof Error ? err.message : String(err)) + "\n");
    for (const scene of script.scenes) await silentAudio(outDir, scene.id, Math.ceil(scene.minDurationMs / 1000) + 1);
    timings = buildTimings(
      script,
      script.scenes.map((s) => ({ sceneId: s.id, durationMs: s.minDurationMs })),
      fps
    );
    await fs.writeFile(path.join(outDir, "transcript.txt"), script.scenes.map((s) => s.narration).join("\n\n") + "\n");
  }

  // 3) Point every scene at its still and mark the cut as a simulation.
  timings.simulation = true;
  timings.timings = timings.timings.map((t) => ({ ...t, videoFile: stillFiles.get(t.sceneId) ?? t.videoFile }));
  await fs.writeFile(path.join(outDir, "timings.json"), JSON.stringify(timings, null, 2));

  // 4) Render both cuts (DEMO_ASPECT narrows to one).
  const aspect = process.env.DEMO_ASPECT;
  const outputs: string[] = [];
  if (aspect !== "9x16") outputs.push(await renderRemotion(script.slug, "SplitScreen", ""));
  if (aspect !== "16x9") outputs.push(await renderRemotion(script.slug, "SplitScreenVertical", "-9x16"));
  process.stdout.write("[simulate] done " + JSON.stringify({ outputs }) + "\n");
}

main().catch((err) => {
  process.stderr.write("[simulate] error: " + (err instanceof Error ? err.message : String(err)) + "\n");
  process.exit(1);
});
