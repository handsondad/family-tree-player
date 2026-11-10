import { useEffect, useRef, useState } from "react";
import { GameDone, GameIntro } from "../components/GameKit";
import { TopBar } from "../components/Shared";
import { gameLines } from "../data/lines";
import { ageWord } from "../lib/train";
import { chainSpeech, matchDeck, matchPairs, matchStars, type MatchCard } from "../lib/games";
import { stepsText } from "../data/relatives";
import { chime, dad, nian, say } from "../lib/speech";
import type { GameProps } from "./games";

export function MatchPage({ settings, onBack, onTree, onFinish }: GameProps) {
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [deck, setDeck] = useState(() => matchDeck());
  const [open, setOpen] = useState<readonly number[]>([]);
  const [matched, setMatched] = useState<ReadonlySet<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const later = useRef(0);
  const stars = matchStars(moves);

  useEffect(() => () => window.clearTimeout(later.current), []);

  function start() {
    window.clearTimeout(later.current);
    setDeck(matchDeck());
    setOpen([]);
    setMatched(new Set());
    setMoves(0);
    setPhase("play");
  }

  function flip(i: number) {
    const card = deck[i];
    if (open.length >= 2 || open.includes(i) || matched.has(card.relative.id)) return;
    if (settings.sound) say(card.face === "chain" ? dad(chainSpeech(card.relative)) : nian(card.relative.call));
    if (!open.length) {
      setOpen([i]);
      return;
    }
    const first = deck[open[0]];
    const count = moves + 1;
    setMoves(count);
    setOpen([open[0], i]);
    if (first.relative.id !== card.relative.id) {
      later.current = window.setTimeout(() => setOpen([]), 1300);
      return;
    }
    const done = new Set(matched).add(card.relative.id);
    if (settings.sound) chime(true);
    later.current = window.setTimeout(() => {
      setMatched(done);
      setOpen([]);
      if (done.size < matchPairs) return;
      const earned = matchStars(count);
      setPhase("done");
      onFinish(earned);
      if (settings.sound) say(dad(gameLines.match.done[earned - 1]));
    }, 700);
  }

  const top = <TopBar emoji="🃏" title="翻牌配对" onBack={onBack} settings={settings} />;

  if (phase === "intro") {
    return <div className="page game-page">{top}<GameIntro emoji="🃏" title="翻牌配对" intro={gameLines.match.intro} settings={settings} onStart={start} /></div>;
  }
  if (phase === "done") {
    return (
      <div className="page game-page">
        {top}
        <GameDone stars={stars} summary={`翻了 ${moves} 次，配好 ${matchPairs} 对`} line={gameLines.match.done[stars - 1]}
          onTree={onTree} onAgain={start} onBack={onBack} />
      </div>
    );
  }

  return (
    <div className="page game-page">
      {top}
      <p className="game-score">
        <span>配好 {matched.size} / {matchPairs} 对</span>
        <span>翻了 {moves} 次</span>
      </p>
      <div className="match-grid">
        {deck.map((card, i) => {
          const shown = open.includes(i) || matched.has(card.relative.id);
          const pairDone = matched.has(card.relative.id);
          return (
            <button key={card.key} type="button" className={`match-card${shown ? " is-open" : ""}${pairDone ? " is-done" : ""}`}
              aria-label={shown ? faceLabel(card) : "一张还没翻开的牌"} onClick={() => flip(i)}>
              <span className="match-inner">
                <span className="match-back" aria-hidden="true">🌳</span>
                <span className={`match-front is-${card.face}`} aria-hidden="true"><Face card={card} /></span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const faceLabel = (card: MatchCard) => (card.face === "chain" ? chainSpeech(card.relative) : card.relative.call);

function Face({ card }: { card: MatchCard }) {
  const { relative } = card;
  if (card.face === "call") {
    return (
      <>
        <span className="match-emoji">{relative.emoji}</span>
        <b>{relative.call}</b>
      </>
    );
  }
  return (
    <>
      <small>是谁？</small>
      <b>{stepsText(relative.steps)}</b>
      {relative.age && <small>（{ageWord(relative)}）</small>}
    </>
  );
}
