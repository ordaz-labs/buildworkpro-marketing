import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { captureScript } from "./capture.js";
import { narrateScript } from "./narrate.js";
import { DemoScript } from "./types.js";
import { loadEnv } from "./env.js";

// Renders one composition of the finished clip. The composition reads
// everything from --props (the timings.json narrate.ts wrote) and resolves
// media with staticFile() against --public-dir, so the Remotion bundle never
// touches the filesystem itself.
export async function renderRemotion(slug: string, composition: "DemoVideo" | "SplitScreen" | "SplitScreenVertical", suffix = ""): Promise<string> {
  const outDir = path.resolve("output", slug);
  const outFile = path.join(outDir, `final${suffix}.mp4`);
  const args = [
    "remotion",
    "render",
    "src/remotion/index.ts",
    composition,
    outFile,
    `--props=${path.join(outDir, "timings.json")}`,
    `--public-dir=${outDir}`,
  ];
  await new Promise<void>((resolve, reject) => {
    const child = spawn("npx", args, { stdio: "inherit", env: process.env });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error("remotion render failed: " + JSON.stringify({ composition, code })))));
  });
  return outFile;
}

// Which cuts to produce. Full-frame scripts get one 16:9 cut. Split-screen
// scripts get 16:9 (site, YouTube, X landscape) and 9:16 (Reels, Stories,
// X vertical); DEMO_ASPECT=16x9|9x16 narrows it to one while iterating.
export function cutsFor(script: DemoScript): Array<{ composition: "DemoVideo" | "SplitScreen" | "SplitScreenVertical"; suffix: string }> {
  if (script.layout !== "split") return [{ composition: "DemoVideo", suffix: "" }];
  const aspect = process.env.DEMO_ASPECT;
  const all = [
    { composition: "SplitScreen" as const, suffix: "" },
    { composition: "SplitScreenVertical" as const, suffix: "-9x16" },
  ];
  if (aspect === "16x9") return [all[0]];
  if (aspect === "9x16") return [all[1]];
  return all;
}

// A split-screen clip is a claim about what the agent said. Placeholder
// lines are fine for timing a rough cut, never for a public one.
export function assertTranscript(script: DemoScript) {
  if (script.layout === "split" && script.phone?.transcriptStatus !== "real" && process.env.DEMO_ALLOW_DRAFT_TRANSCRIPT !== "1") {
    throw new Error(
      `Script "${script.slug}" has phone.transcriptStatus="${script.phone?.transcriptStatus ?? "draft"}". ` +
        "Re-typeset the phone lines from a real recorded transcript and set transcriptStatus to \"real\", " +
        "or set DEMO_ALLOW_DRAFT_TRANSCRIPT=1 for a rough cut that must not be published."
    );
  }
}

async function main() {
  loadEnv();
  const scriptArg = process.argv[2];
  if (!scriptArg) {
    process.stderr.write("Usage: tsx src/pipeline.ts <script.json>\n");
    process.exit(1);
  }
  const raw = JSON.parse(await fs.readFile(scriptArg, "utf8"));
  const script = DemoScript.parse(raw);
  assertTranscript(script);

  process.stdout.write("[pipeline] start " + JSON.stringify({ slug: script.slug, layout: script.layout, scenes: script.scenes.length }) + "\n");

  await captureScript(scriptArg);
  await narrateScript(scriptArg);
  const outputs: string[] = [];
  for (const cut of cutsFor(script)) {
    outputs.push(await renderRemotion(script.slug, cut.composition, cut.suffix));
  }

  process.stdout.write("[pipeline] done " + JSON.stringify({ outputs }) + "\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    process.stderr.write("[pipeline] error: " + (err instanceof Error ? err.message : String(err)) + "\n");
    process.exit(1);
  });
}
