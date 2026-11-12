import { useEffect, useRef, useState } from "react";
import { GameDone, GameIntro } from "../components/GameKit";
import { DadSays, Person, SpeakButton, TopBar } from "../components/Shared";
import { gameLines } from "../data/lines";
import type { Relative } from "../data/relatives";
import { sideExplain, sidesCount, sidesRound } from "../lib/games";
import { starsFor } from "../lib/quiz";
import { chime, dad, nian, say } from "../lib/speech";
import type { GameProps } from "./games";

type Side = "dad" | "mom";
type Sorted = { relative: Relative; right: boolean };

const bins: readonly { side: Side; emoji: string; label: string; key: string }[] = [
  { side: "dad", emoji: "👨", label: "爸爸家", key: "ArrowLeft" },
  { side: "mom", emoji: "👩", label: "妈妈家", key: "ArrowRight" }
];

export function SidesPage({ settings, onBack, onTree, onFinish }: GameProps) {
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [cards, setCards] = useState(() => sidesRound());
  const [index, setIndex] = useState(0);
  const [sorted, setSorted] = useState<readonly Sorted[]>([]);
  const [streak, setStreak] = useState(0);
  const [wrong, setWrong] = useState<Side | null>(null);
  const later = useRef(0);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const card = cards[index];
  const score = sorted.filter((item) => item.right).length;
  const missed = sorted.filter((item) => !item.right).map((item) => item.relative);
  const stars = starsFor(score, sidesCount);
  const waiting = sorted.length > index;

  useEffect(() => {
    if (phase === "play" && settings.sound) say(nian(card.call));
    return () => window.clearTimeout(later.current);
  }, [phase, index]);

  useEffect(() => {
    if (phase !== "play") return;
    const onKey = (event: KeyboardEvent) => {
      const bin = bins.find((item) => item.key === event.key);
      if (bin) pick(bin.side);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function start() {
    setCards(sidesRound());
    setIndex(0);
    setSorted([]);
    setStreak(0);
    setWrong(null);
    setPhase("play");
  }

  function pick(side: Side) {
    if (waiting) return;
    const right = side === card.side;
    setSorted([...sorted, { relative: card, right }]);
    setStreak(right ? streak + 1 : 0);
    if (settings.sound) chime(right);
    if (right) later.current = window.setTimeout(() => next(score + 1), 600);
    else {
      setWrong(side);
      window.requestAnimationFrame(() => feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
      if (settings.sound) later.current = window.setTimeout(() => say(dad(sideExplain(card))), 350);
    }
  }

  function next(finalScore = score) {
    setWrong(null);
    if (index + 1 < cards.length) {
      setIndex(index + 1);
      return;
    }
    const earned = starsFor(finalScore, sidesCount);
    setPhase("done");
    onFinish(earned);
    if (settings.sound) say(dad(gameLines.sides.done[earned - 1]));
  }

  const top = <TopBar emoji="🏠" title="爸爸家还是妈妈家" onBack={onBack} settings={settings} />;

  if (phase === "intro") {
    return <div className="page game-page">{top}<GameIntro emoji="🏠" title="爸爸家还是妈妈家" intro={gameLines.sides.intro} settings={settings} onStart={start} /></div>;
  }
  if (phase === "done") {
    return (
      <div className="page game-page">
        {top}
        <GameDone stars={stars} summary={`分对了 ${score} / ${sidesCount} 位`} line={gameLines.sides.done[stars - 1]}
          missed={missed} onTree={onTree} onAgain={start} onBack={onBack} />
      </div>
    );
  }

  return (
    <div className="page game-page">
      {top}
      <p className="game-score">
        <span>第 {index + 1} / {sidesCount} 位</span>
        <span>{streak >= 2 ? `🔥 连对 ${streak} 个` : `✅ × ${score}`}</span>
      </p>

      <div className="sides">
        {bins.map(({ side, emoji, label }, i) => {
          const pile = sorted.filter((item) => item.relative.side === side);
          const state = !waiting
            ? ""
            : wrong === null
              ? (side === card.side ? " is-right" : "")
              : side === card.side ? " is-hint" : side === wrong ? " is-wrong" : "";
          return (
            <button key={side} type="button" className={`side-bin is-${side}${state}`} disabled={waiting} onClick={() => pick(side)}
              style={{ order: i === 0 ? 0 : 2 }}>
              <span className="side-bin-head"><span aria-hidden="true">{emoji}</span>{label}</span>
              <span className="side-pile">
                {pile.map(({ relative, right }) => (
                  <span key={relative.id} className={`row-chip${right ? "" : " is-fixed"}`}><span aria-hidden="true">{relative.emoji}</span>{relative.call}</span>
                ))}
              </span>
              <small aria-hidden="true">{i === 0 ? "← 键" : "→ 键"}</small>
            </button>
          );
        })}

        <section className="card sides-card" aria-live="polite" aria-labelledby="sides-now" style={{ order: 1 }}>
          <div key={index} className="drop-in">
            <Person emoji={card.emoji} side={waiting ? card.side : "home"} size="lg" />
          </div>
          <h2 id="sides-now" className="rows-name">{card.call} <SpeakButton who="nian" text={card.call} label={`听小念叫：${card.call}`} /></h2>
          <p className="rows-ask">{waiting ? (wrong === null ? "分对啦！" : "分错啦") : "是爸爸家的，还是妈妈家的？"}</p>
        </section>
      </div>

      {wrong !== null && (
        <div ref={feedbackRef} className="feedback sides-feedback">
          <DadSays>{sideExplain(card)}</DadSays>
          <button type="button" className="primary-btn" onClick={() => next()} autoFocus>下一位 →</button>
        </div>
      )}
    </div>
  );
}
