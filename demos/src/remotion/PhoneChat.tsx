import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import type { PhoneConfig, PhoneMessage } from "../types";

// The phone side of a split-screen scene. Renders a device frame with a chat
// whose bubbles appear at their `atMs` offsets. Everything is CSS — no
// screenshots of a real chat app, no third-party logos. The theme only sets
// the chrome colors; the copy comes from the script (ideally re-typeset from a
// real transcript, see PhoneConfig.transcriptStatus).

type Theme = { top: string; topText: string; screen: string; agentBubble: string; youBubble: string; accent: string; ink: string };

const THEMES: Record<PhoneConfig["theme"], Theme> = {
  grokbot: { top: "#000000", topText: "#ffffff", screen: "#f4f4f5", agentBubble: "#ffffff", youBubble: "#e4e4e7", accent: "#000000", ink: "#0f172a" },
  claude: { top: "#1f1f1f", topText: "#ffffff", screen: "#f7f5f2", agentBubble: "#ffffff", youBubble: "#e8e0d6", accent: "#d97757", ink: "#1f1f1f" },
  whatsapp: { top: "#075e54", topText: "#ffffff", screen: "#ece5dd", agentBubble: "#ffffff", youBubble: "#dcf8c6", accent: "#075e54", ink: "#0f172a" },
  terminal: { top: "#0b1220", topText: "#e2e8f0", screen: "#0f172a", agentBubble: "#1e293b", youBubble: "#172554", accent: "#60a5fa", ink: "#e2e8f0" },
};

// Loose on purpose: the composition receives the script through input props,
// where transcriptStatus is optional; PhoneChat only needs theme/name/subtitle.
export type PhoneChatProps = {
  phone: { theme: PhoneConfig["theme"]; name: string; subtitle?: string };
  messages: PhoneMessage[];
  /** Device width in px; height follows a 19.5:9 ratio. */
  width: number;
  /** Frames since the scene started (Sequence-relative). */
  fps: number;
};

const TYPING_MS = 900;

export const PhoneChat: React.FC<PhoneChatProps> = ({ phone, messages, width, fps }) => {
  const frame = useCurrentFrame();
  const tMs = (frame / fps) * 1000;
  const theme = THEMES[phone.theme];
  const height = Math.round(width * (19.5 / 9));
  const radius = Math.round(width * 0.14);
  const pad = Math.round(width * 0.04);
  const fontSize = Math.round(width * 0.052);
  const isTerminal = phone.theme === "terminal";

  const visible = messages.filter((m) => m.atMs <= tMs);
  const typingFor = messages.find((m) => m.from === "agent" && m.atMs > tMs && m.atMs - TYPING_MS <= tMs);

  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: "#0b1220",
        padding: pad,
        boxShadow: "0 40px 80px rgba(2, 6, 23, 0.45)",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div style={{ width: "100%", height: "100%", borderRadius: radius - pad, background: theme.screen, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ background: theme.top, color: theme.topText, padding: `${pad * 1.6}px ${pad * 1.4}px ${pad}px`, display: "flex", alignItems: "center", gap: pad }}>
          <div style={{ width: fontSize * 1.9, height: fontSize * 1.9, borderRadius: "50%", background: isTerminal ? theme.accent : "linear-gradient(135deg, #f59e0b, #ea580c)", flex: "none" }} />
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontSize: fontSize * 1.05, fontWeight: 700 }}>{phone.name}</div>
            {phone.subtitle && <div style={{ fontSize: fontSize * 0.8, opacity: 0.8 }}>{phone.subtitle}</div>}
          </div>
        </div>

        <div style={{ flex: 1, padding: pad, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: pad * 0.8, overflow: "hidden" }}>
          {visible.map((m, i) => (
            <Bubble key={`${m.atMs}-${i}`} message={m} theme={theme} fontSize={fontSize} pad={pad} fps={fps} appearedAtFrame={Math.round((m.atMs / 1000) * fps)} terminal={isTerminal} />
          ))}
          {typingFor && <Typing theme={theme} fontSize={fontSize} pad={pad} frame={frame} />}
        </div>

        <div style={{ background: isTerminal ? "#0b1220" : "rgba(0,0,0,0.05)", padding: `${pad * 0.8}px ${pad}px`, display: "flex", gap: pad * 0.7, alignItems: "center" }}>
          <div style={{ flex: 1, background: isTerminal ? "#111827" : "#ffffff", borderRadius: 999, height: fontSize * 1.9, color: "#94a3b8", fontSize: fontSize * 0.85, display: "flex", alignItems: "center", paddingLeft: pad }}>
            {isTerminal ? "$" : `Message ${phone.name}`}
          </div>
          <div style={{ width: fontSize * 1.9, height: fontSize * 1.9, borderRadius: "50%", background: theme.accent }} />
        </div>
      </div>
    </div>
  );
};

const Bubble: React.FC<{ message: PhoneMessage; theme: Theme; fontSize: number; pad: number; fps: number; appearedAtFrame: number; terminal: boolean }> = ({ message, theme, fontSize, pad, fps, appearedAtFrame, terminal }) => {
  const frame = useCurrentFrame();
  const enter = spring({ frame: frame - appearedAtFrame, fps, config: { damping: 14, stiffness: 160 } });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [14, 0]);
  const you = message.from === "you";
  return (
    <div
      style={{
        alignSelf: you ? "flex-end" : "flex-start",
        maxWidth: "86%",
        background: you ? theme.youBubble : theme.agentBubble,
        color: theme.ink,
        borderRadius: fontSize * 0.9,
        borderBottomRightRadius: you ? fontSize * 0.25 : undefined,
        borderBottomLeftRadius: you ? undefined : fontSize * 0.25,
        padding: `${pad * 0.8}px ${pad}px`,
        fontSize,
        lineHeight: 1.35,
        fontFamily: terminal ? "ui-monospace, SFMono-Regular, Menlo, monospace" : undefined,
        boxShadow: terminal ? undefined : "0 1px 1px rgba(0,0,0,0.08)",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {terminal && <span style={{ color: theme.accent, marginRight: 8 }}>{you ? ">" : "•"}</span>}
      {message.text}
      {message.time && <div style={{ fontSize: fontSize * 0.68, color: "#94a3b8", textAlign: "right", marginTop: pad * 0.3 }}>{message.time}</div>}
    </div>
  );
};

const Typing: React.FC<{ theme: Theme; fontSize: number; pad: number; frame: number }> = ({ theme, fontSize, pad, frame }) => {
  const dot = (i: number) => 0.35 + 0.65 * Math.abs(Math.sin((frame / 6) + i * 0.9));
  return (
    <div style={{ alignSelf: "flex-start", background: theme.agentBubble, borderRadius: fontSize * 0.9, borderBottomLeftRadius: fontSize * 0.25, padding: `${pad * 0.8}px ${pad * 1.1}px`, display: "flex", gap: fontSize * 0.35 }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: fontSize * 0.42, height: fontSize * 0.42, borderRadius: "50%", background: "#94a3b8", opacity: dot(i), display: "block" }} />
      ))}
    </div>
  );
};
