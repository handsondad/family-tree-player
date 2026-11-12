import { useEffect, useRef, useState } from "react";
import { Burst, GameDone, GameIntro } from "../components/GameKit";
import { DadSays, NianSays, Person, SpeakButton, TopBar } from "../components/Shared";
import { gameLines } from "../data/lines";
import type { Relative } from "../data/relatives";
import { doorCount, doorRound, greeting } from "../lib/games";
import { starsFor, wrongLine } from "../lib/quiz";
import { chime, dad, nian, say } from "../lib/speech";
import type { GameProps } from "./games";

export function DoorPage({ settings, onBack, onTree, onFinish }: GameProps) {
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [guests, setGuests] = useState(() => doorRound());
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [missed, setMissed] = useState<readonly Relative[]>([]);
  const later = useRef(0);
  const guest = guests[index];
  const gifts = index + (picked ? 1 : 0) - missed.length;
  const stars = starsFor(gifts, doorCount);

  useEffect(() => {
    if (phase === "play" && settings.sound) say(dad(guest.prompt));
    return () => window.clearTimeout(later.current);
  }, [phase, index]);

  function start() {
    setGuests(doorRound());
    setIndex(0);
    setPicked(null);
    setMissed([]);
    setPhase("play");
  }

  function choose(option: string) {
    if (picked) return;
    setPicked(option);
    const right = option === guest.answer;
    if (!right) setMissed([...missed, guest.relative]);
    if (!settings.sound) return;
    chime(right);
    later.current = window.setTimeout(() => {
      if (right) say(nian(greeting(guest.relative)));
      else say(dad(wrongLine(guest.answer)), dad(guest.relative.tip));
    }, 350);
  }

  function next() {
    if (index + 1 < guests.length) {
      setIndex(index + 1);
      setPicked(null);
      return;
    }
    setPhase("done");
    onFinish(stars);
    if (settings.sound) say(dad(gameLines.door.done[stars - 1]));
  }

  const top = <TopBar emoji="🧧" title="过年拜年" onBack={onBack} settings={settings} />;

  if (phase === "intro") {
    return <div className="page game-page">{top}<GameIntro emoji="🧧" title="过年拜年" intro={gameLines.door.intro} settings={settings} onStart={start} /></div>;
  }
  if (phase === "done") {
    return (
      <div className="page game-page">
        {top}
        <GameDone stars={stars} summary={`收到 ${gifts} / ${doorCount} 个红包`} line={gameLines.door.done[stars - 1]}
          missed={missed} onTree={onTree} onAgain={start} onBack={onBack}>
          <p className="door-haul" aria-hidden="true">{"🧧".repeat(gifts) || "🙈"}</p>
        </GameDone>
      </div>
    );
  }

  const right = picked === guest.answer;
  return (
    <div className="page game-page">
      {top}
      <p className="game-score" aria-label={`第 ${index + 1} 位客人，共 ${doorCount} 位；收到 ${gifts} 个红包`}>
        <span>第 {index + 1} / {doorCount} 位客人</span>
        <span>🧧 × {gifts}</span>
      </p>

      <section className="card quiz-card" aria-labelledby="door-prompt">
        <div key={index} className="door-scene" aria-hidden="true">
          <span className="door-frame">
            <span className="door-guest">
              <Person emoji={guest.relative.emoji} side={guest.relative.side} size="lg">
                {!picked && <span className="figure-q">?</span>}
              </Person>
            </span>
            <span className="door-leaf is-left" />
            <span className="door-leaf is-right" />
          </span>
          {picked && right && <span className="door-gift">🧧</span>}
        </div>
        <h2 id="door-prompt" className="quiz-prompt">
          {guest.prompt} <SpeakButton who="dad" text={guest.prompt} label="听爸爸说是谁" />
        </h2>
        <div className="options">
          {guest.options.map((option) => {
            const state = !picked ? "" : option === guest.answer ? " is-right" : option === picked ? " is-wrong" : " is-dim";
            return (
              <button key={option} type="button" className={`option${state}`} disabled={!!picked && option !== picked && option !== guest.answer}
                aria-pressed={picked === option} onClick={() => choose(option)}>
                {option}
                {state === " is-right" && <span aria-label="对"> ✓</span>}
                {state === " is-wrong" && <span aria-label="错"> ✗</span>}
              </button>
            );
          })}
        </div>

        {picked && (
          <div className="feedback" aria-live="polite">
            {right && <Burst key={index} />}
            {right ? (
              <>
                <NianSays>{greeting(guest.relative)}</NianSays>
                <p className="verdict is-right">🧧 {guest.relative.call}给了你一个红包！</p>
              </>
            ) : (
              <>
                <p className="verdict is-wrong">😮 叫错啦，应该叫「{guest.answer}」</p>
                <DadSays>{guest.relative.tip}</DadSays>
              </>
            )}
            <button type="button" className="primary-btn" onClick={next} autoFocus>
              {index + 1 < guests.length ? "下一位客人 →" : "数数红包 →"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
