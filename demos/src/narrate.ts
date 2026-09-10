import fs from "node:fs/promises";
import path from "node:path";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { parseFile } from "music-metadata";
import { DemoScript, type SceneTiming, type TimingsFile } from "./types.js";
import { loadEnv } from "./env.js";

const DEFAULT_VOICE = "pNInz6obpgDQGcFmaJgB"; // Adam pre-made
const DEFAULT_MODEL = "eleven_multilingual_v2";

async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Buffer[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks);
}

export async function narrateScript(scriptPath: string): Promise<{ outDir: string; clips: Array<{ sceneId: string; audioPath: string; durationMs: number }> }> {
  loadEnv();
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY missing — set it in demos/.env");
  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE;
  const modelId = process.env.ELEVENLABS_MODEL_ID || DEFAULT_MODEL;
  const fps = Number(process.env.DEMO_FPS || 30);

  const raw = JSON.parse(await fs.readFile(scriptPath, "utf8"));
  const script = DemoScript.parse(raw);
  const outDir = path.resolve("output", script.slug);
  await fs.mkdir(outDir, { recursive: true });

  const client = new ElevenLabsClient({ apiKey });
  const clips: Array<{ sceneId: string; audioPath: string; durationMs: number }> = [];
  const transcriptLines: string[] = [];

  for (const scene of script.scenes) {
    process.stdout.write("[narrate] " + JSON.stringify({ id: scene.id }) + "\n");
    const audio = await client.textToSpeech.convert(voiceId, {
      text: scene.narration,
      modelId,
      outputFormat: "mp3_44100_128",
      voiceSettings: {
        stability: 0.45,
        similarityBoost: 0.78,
        style: 0.25,
        useSpeakerBoost: true,
      },
    });
    const buffer = await streamToBuffer(audio as ReadableStream<Uint8Array>);
    const audioPath = path.join(outDir, `${scene.id}.mp3`);
    await fs.writeFile(audioPath, buffer);

    const meta = await parseFile(audioPath);
    const durationMs = Math.round((meta.format.duration ?? scene.minDurationMs / 1000) * 1000);

    clips.push({ sceneId: scene.id, audioPath, durationMs });
    transcriptLines.push(scene.narration);
  }

  await fs.writeFile(path.join(outDir, "transcript.txt"), transcriptLines.join("\n\n") + "\n");
  await fs.writeFile(path.join(outDir, "timings.json"), JSON.stringify(buildTimings(script, clips, fps), null, 2));

  return { outDir, clips };
}

// Shared with the render smoke test: the timings.json shape Remotion reads.
// Media entries are basenames inside output/<slug>/ so the composition can
// resolve them with staticFile() against --public-dir.
export function buildTimings(script: DemoScript, clips: Array<{ sceneId: string; durationMs: number }>, fps: number): TimingsFile {
  const timings: SceneTiming[] = clips.map((c) => {
    const scene = script.scenes.find((s) => s.id === c.sceneId)!;
    // Whichever is longer: scene minimum, narration + breathing room, or the
    // last phone bubble + a beat so the chat never gets cut off mid-reveal.
    const lastBubble = Math.max(0, ...(scene.messages ?? []).map((m) => m.atMs + 1500));
    const ms = Math.max(scene.minDurationMs, c.durationMs + 600, lastBubble);
    return {
      sceneId: c.sceneId,
      ...(scene.still ? { still: { focusX: scene.still.focusX, focusY: scene.still.focusY, zoom: scene.still.zoom } } : {}),
      videoFile: `${c.sceneId}.webm`,
      audioFile: `${c.sceneId}.mp3`,
      durationFrames: Math.ceil((ms / 1000) * fps),
    };
  });
  return { script, timings, fps };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const scriptArg = process.argv[2];
  if (!scriptArg) {
    process.stderr.write("Usage: tsx src/narrate.ts <script.json>\n");
    process.exit(1);
  }
  narrateScript(scriptArg)
    .then(({ outDir }) => {
      process.stdout.write("[narrate] done " + JSON.stringify({ outDir }) + "\n");
    })
    .catch((err) => {
      process.stderr.write("[narrate] error: " + (err instanceof Error ? err.message : String(err)) + "\n");
      process.exit(1);
    });
}
