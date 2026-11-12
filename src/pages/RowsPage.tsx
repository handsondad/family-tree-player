import { useEffect, useRef, useState } from "react";
import { GameDone, GameIntro } from "../components/GameKit";
import { DadSays, Person, SpeakButton, TopBar, meEmoji } from "../components/Shared";
import { gameLines } from "../data/lines";
import type { Relative } from "../data/relatives";
import { genRows, rowExplain, rowsCount, rowsRound } from "../lib/games";
import { starsFor } from "../lib/quiz";
import { chime, dad, nian, say } from "../lib/speech";
import type { GameProps } from "./games";

/** 每一排先站好的"自己人"，帮小朋友找到位置。 */
const anchors: Record<number, readonly { emoji: string; name: string }[]> = {
  1: [{ emoji: "👨", name: "爸爸" }, { emoji: "👩", name: "妈妈" }],
  0: [{ emoji: meEmoji, name: "我" }]
};

type Placed = { relative: Relative; right: boolean };

export function RowsPage({ settings, onBack, onTree, onFinish }: GameProps) {
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [cards, setCards] = useState(() => rowsRound());
  const [index, setIndex] = useState(0);
  const [placed, setPlaced] = useState<readonly Placed[]>([]);
  /** 放错时记下点的那一排，等小朋友看完讲解再继续。 */
  const [wrongGen, setWrongGen] = useState<number | null>(null);
  const later = useRef(0);
  const card = cards[index];
  const score = placed.filter((item) => item.right).length;
  const missed = placed.filter((item) => !item.right).map((item) => item.relative);
  const stars = starsFor(score, rowsCount);

  useEffect(() => {
    if (phase === "play" && settings.sound) say(nian(card.call));
    return () => window.clearTimeout(later.current);
  }, [phase, index]);

  function start() {
    setCards(rowsRound());
    setIndex(0);
    setPlaced([]);
    setWrongGen(null);
    setPhase("play");
  }

  function drop(gen: number) {
    if (wrongGen !== null || placed.length > index) return;
    const right = gen === card.gen;
    setPlaced([...placed, { relative: card, right }]);
    if (settings.sound) chime(right);
    if (right) later.current = window.setTimeout(() => next(score + 1), 650);
    else {
      setWrongGen(gen);
      if (settings.sound) later.current = window.setTimeout(() => say(dad(rowExplain(card))), 350);
    }
  }

  function next(finalScore = score) {
    setWrongGen(null);
    if (index + 1 < cards.length) {
      setIndex(index + 1);
      return;
    }
    const earned = starsFor(finalScore, rowsCount);
    setPhase("done");
    onFinish(earned);
    if (settings.sound) say(dad(gameLines.rows.done[earned - 1]));
  }

  const top = <TopBar emoji="🪜" title="辈分排排站" onBack={onBack} settings={settings} />;

  if (phase === "intro") {
    return <div className="page game-page">{top}<GameIntro emoji="🪜" title="辈分排排站" intro={gameLines.rows.intro} settings={settings} onStart={start} /></div>;
  }
  if (phase === "done") {
    return (
      <div className="page game-page">
        {top}
        <GameDone stars={stars} summary={`站对了 ${score} / ${rowsCount} 位`} line={gameLines.rows.done[stars - 1]}
          missed={missed} onTree={onTree} onAgain={start} onBack={onBack} />
      </div>
    );
  }

  const waiting = placed.length > index;
  return (
    <div className="page game-page">
      {top}
      <p className="game-score">
        <span>第 {index + 1} / {rowsCount} 位</span>
        <span>✅ × {score}</span>
      </p>

      <div className="rows-layout">
        <section className="card rows-card" aria-live="polite" aria-labelledby="rows-now">
          <div key={index} className="drop-in">
            <Person emoji={card.emoji} side={card.side} size="lg" />
          </div>
          <h2 id="rows-now" className="rows-name">{card.call} <SpeakButton who="nian" text={card.call} label={`听小念叫：${card.call}`} /></h2>
          <p className="rows-ask">{waiting ? (wrongGen === null ? "站对啦！" : "站错队啦") : `${card.call}该站在哪一排？`}</p>
          {wrongGen !== null && (
            <div className="feedback">
              <DadSays>{rowExplain(card)}</DadSays>
              <button type="button" className="primary-btn" onClick={() => next()} autoFocus>下一位 →</button>
            </div>
          )}
        </section>

        <div className="rows" role="group" aria-label="辈分">
          {genRows.map(({ gen, label, emoji }) => {
            const here = placed.filter((item) => item.relative.gen === gen);
            const state = !waiting
              ? ""
              : wrongGen === null
                ? (gen === card.gen ? " is-right" : "")
                : gen === card.gen ? " is-hint" : gen === wrongGen ? " is-wrong" : "";
            return (
              <button key={gen} type="button" className={`row${state}`} disabled={waiting} onClick={() => drop(gen)}>
                <span className="row-label"><span aria-hidden="true">{emoji}</span>{label}</span>
                <span className="row-people">
                  {anchors[gen]?.map((anchor) => (
                    <span key={anchor.name} className="row-chip is-anchor"><span aria-hidden="true">{anchor.emoji}</span>{anchor.name}</span>
                  ))}
                  {here.map(({ relative, right }) => (
                    <span key={relative.id} className={`row-chip${right ? "" : " is-fixed"}`}><span aria-hidden="true">{relative.emoji}</span>{relative.call}</span>
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
