import type { CSSProperties, ReactNode } from "react";
import { calledMeFor, me, type Relative, type Side } from "../data/relatives";
import type { Who } from "../data/voice-lines";
import { isSpeaking, say, useSpeaking } from "../lib/speech";
import { Avatar } from "./Avatar";

export type Settings = {
  sound: boolean;
  setSound: (sound: boolean) => void;
};

export const sideColor: Record<Side, string> = { dad: "#4d96ff", mom: "#ff6bd6", home: "#ff9f43" };

export const meEmoji = "👦";

/** TA 叫你什么。 */
export const calledMeText = (relative: Relative) => calledMeFor(relative, me);

export function SpeakButton({ who, text, label }: { who: Who; text: string; label?: string }) {
  const speaking = isSpeaking(useSpeaking(), who, text);
  return (
    <button type="button" className={`speak-btn${speaking ? " is-speaking" : ""}`} aria-label={label ?? `听${who === "nian" ? "小念" : "爸爸"}读：${text}`}
      onClick={() => say({ who, text })}>
      🔊
    </button>
  );
}

type TopBarProps = { emoji: string; title: string; onBack: () => void; backLabel?: string; settings: Settings };

export function TopBar({ emoji, title, onBack, backLabel = "回到首页", settings }: TopBarProps) {
  const { sound, setSound } = settings;
  return (
    <header className="topbar">
      <button type="button" className="pill-btn" onClick={onBack}>← {backLabel}</button>
      <h1><span aria-hidden="true">{emoji}</span> {title}</h1>
      <div className="topbar-tools">
        <button type="button" className="pill-btn sound-btn" aria-pressed={sound} onClick={() => setSound(!sound)}
          aria-label={sound ? "小念和爸爸自动说话：开" : "小念和爸爸自动说话：关"} title={sound ? "小念和爸爸会自动说话" : "只有点 🔊 才说话"}>
          {sound ? "🔊" : "🔇"}
        </button>
      </div>
    </header>
  );
}

type PersonProps = { emoji: string; side: Side; size?: "sm" | "md" | "lg"; children?: ReactNode };

export function Person({ emoji, side, size = "md", children }: PersonProps) {
  return (
    <span className={`person is-${size}`} style={{ "--side": sideColor[side] } as CSSProperties} aria-hidden="true">
      {emoji}
      {children}
    </span>
  );
}

function Says({ who, children }: { who: Who; children: string }) {
  const speaking = isSpeaking(useSpeaking(), who, children);
  const name = who === "nian" ? "小念" : "爸爸";
  return (
    <div className={`says is-${who}${speaking ? " is-speaking" : ""}`}>
      <span className="says-avatar"><Avatar who={who} /></span>
      <div className="says-bubble">
        <b>{name}说 <SpeakButton who={who} text={children} label={`听${name}说`} /></b>
        <p>{children}</p>
      </div>
    </div>
  );
}

export const DadSays = ({ children }: { children: string }) => <Says who="dad">{children}</Says>;

export const NianSays = ({ children }: { children: string }) => <Says who="nian">{children}</Says>;
