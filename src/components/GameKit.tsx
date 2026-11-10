import { useEffect, type CSSProperties, type ReactNode } from "react";
import type { Relative } from "../data/relatives";
import { dad, say } from "../lib/speech";
import { DadSays, type Settings } from "./Shared";

export const starRow = (count: number, of = 3) => "⭐".repeat(count) + "☆".repeat(of - count);

const burst = ["🎉", "⭐", "✨", "🌟", "🎊", "💛", "⭐", "✨"];

export function Burst() {
  return (
    <div className="burst" aria-hidden="true">
      {burst.map((emoji, i) => <span key={i} style={{ "--a": `${i * 45}deg` } as CSSProperties}>{emoji}</span>)}
    </div>
  );
}

type IntroProps = { emoji: string; title: string; intro: string; settings: Settings; onStart: () => void };

/** 开场：爸爸先把玩法讲一遍。 */
export function GameIntro({ emoji, title, intro, settings, onStart }: IntroProps) {
  useEffect(() => {
    if (settings.sound) say(dad(intro));
  }, []);
  return (
    <section className="card game-intro" aria-labelledby="game-intro-title">
      <span className="game-intro-emoji" aria-hidden="true">{emoji}</span>
      <h2 id="game-intro-title">{title}</h2>
      <DadSays>{intro}</DadSays>
      <button type="button" className="primary-btn" onClick={onStart} autoFocus>开始！</button>
    </section>
  );
}

type DoneProps = {
  stars: number;
  summary: string;
  line: string;
  missed?: readonly Relative[];
  onTree: (id: string) => void;
  onAgain: () => void;
  onBack: () => void;
  children?: ReactNode;
};

/** 结束：星星、成绩、爸爸的话，还有答错的亲戚。 */
export function GameDone({ stars, summary, line, missed = [], onTree, onAgain, onBack, children }: DoneProps) {
  return (
    <section className="card quiz-done" aria-labelledby="game-done-title">
      <p className="done-stars" aria-hidden="true">{starRow(stars)}</p>
      <h2 id="game-done-title">{summary}</h2>
      {children}
      <DadSays>{line}</DadSays>
      {missed.length > 0 && (
        <div className="rc-family">
          <h3>再认识一下</h3>
          <div className="chips">
            {missed.map((relative) => (
              <button key={relative.id} type="button" onClick={() => onTree(relative.id)}>
                <span aria-hidden="true">{relative.emoji}</span> {relative.call}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="done-actions">
        <button type="button" className="primary-btn" onClick={onAgain}>🔁 再玩一次</button>
        <button type="button" className="pill-btn" onClick={onBack}>← 回到首页</button>
      </div>
    </section>
  );
}
