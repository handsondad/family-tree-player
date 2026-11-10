import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { DadSays, SpeakButton, TopBar, calledMeText, meEmoji, type Settings } from "../components/Shared";
import { dadLines } from "../data/lines";
import { me, relativeBySteps, stepsText, type Relative, type Step } from "../data/relatives";
import { calledBy, callOf } from "../lib/kinship";
import { dad, nian, say } from "../lib/speech";
import { ageWord, blocked, emojiOf, examples, guessPool, guessPrompt, guessSpeech, maxCars, namesSpeech, stepButtons, sureRelative, trainNames } from "../lib/train";

type Props = {
  initialSteps: readonly Step[];
  settings: Settings;
  onBack: () => void;
  onTree: (id?: string) => void;
};

export function TrainPage({ initialSteps, settings, onBack, onTree }: Props) {
  const [steps, setSteps] = useState<readonly Step[]>(initialSteps);
  const [guessing, setGuessing] = useState(false);
  /** 猜一猜抽到的亲戚；表姐表妹挂的车厢一样，只能靠出题时说的"比你大 / 比你小"区分。 */
  const [question, setQuestion] = useState<Relative | null>(null);
  const aged = question?.age ? question : null;
  const answer = useMemo(() => callOf(steps, me), [steps]);
  const known = aged ?? relativeBySteps(steps);
  const sure = sureRelative(steps, aged);
  const names = trainNames(steps, me, aged);
  const back = sure ? calledMeText(sure) : calledBy(steps, me).kid.join(" / ");
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (settings.sound && guessing && question) say(dad(guessSpeech(question)));
    else if (settings.sound && names.length) say(nian(namesSpeech(names)), ...(known && known.level > 0 ? [dad(known.tip)] : []));
    const el = trackRef.current;
    if (el) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
  }, [steps, guessing]);

  function set(next: readonly Step[], pick?: Relative) {
    setSteps(next);
    setGuessing(!!pick);
    setQuestion(pick ?? null);
  }

  function guess() {
    const pool = guessPool.filter((relative) => stepsText(relative.steps) !== stepsText(steps));
    const pick = pool[Math.floor(Math.random() * pool.length)];
    set(pick.steps, pick);
  }

  return (
    <div className="page train-page">
      <TopBar emoji="🚂" title="称呼小火车" onBack={onBack} settings={settings} />

      <div className="intro">
        <p><span aria-hidden="true">🚃</span>一节车厢坐一个人。从“我”出发，挂上“爸爸”，再挂上“妈妈”，就是“爸爸的妈妈”。</p>
        <p><span aria-hidden="true">🎲</span>拼好了看看该叫 TA 什么，或者点“猜一猜”，让小火车出题考你。</p>
      </div>

      <div ref={trackRef} className="train" aria-label={`小火车：我${steps.map((step) => `的${step}`).join("")}`}>
        <div className="train-track">
          <span className="car is-engine"><span aria-hidden="true">🚂</span><b>{meEmoji} 我</b></span>
          {steps.map((step, i) => (
            <span key={`${i}-${step}`} className="car" style={{ "--i": i } as CSSProperties}>
              <i>的</i>
              <span aria-hidden="true">{emojiOf.get(step)}</span>
              <b>{step}</b>
            </span>
          ))}
          {steps.length < maxCars && <span className="car is-empty" aria-hidden="true">＋</span>}
        </div>
      </div>

      <div className="train-controls">
        <div className="step-grid" role="group" aria-label="挂一节车厢">
          {stepButtons.map(({ step, emoji }) => {
            const why = blocked(step, steps);
            return (
              <button key={step} type="button" className="step-btn" disabled={!!why} title={why ?? `挂上${step}`}
                onClick={() => set([...steps, step])}>
                <span aria-hidden="true">{emoji}</span>{step}
              </button>
            );
          })}
        </div>
        <div className="train-actions">
          <button type="button" className="pill-btn" disabled={!steps.length} onClick={() => set(steps.slice(0, -1))}>↩ 退一节</button>
          <button type="button" className="pill-btn" disabled={!steps.length} onClick={() => set([])}>🧹 清空</button>
          <button type="button" className="primary-btn" onClick={guess}>🎲 猜一猜</button>
        </div>
      </div>

      <section className="card train-result" aria-live="polite" aria-label="答案">
        {!steps.length ? (
          <DadSays>{dadLines.trainEmpty}</DadSays>
        ) : guessing ? (
          <div className="guess">
            <p className="guess-q">{question && guessPrompt(question)}</p>
            <button type="button" className="primary-btn" onClick={() => setGuessing(false)}>想好了，揭晓答案！</button>
          </div>
        ) : !answer.kid.length ? (
          <DadSays>{dadLines.trainFar}</DadSays>
        ) : (
          <>
            <p className="tr-chain">{stepsText(steps)}</p>
            <div className="tr-answer">
              <small>你叫 TA</small>
              <strong>{names.join(" / ")}</strong>
              <SpeakButton who="nian" text={namesSpeech(names)} label="听小念叫" />
            </div>
            {aged ? <p className="tr-note">TA {ageWord(aged)}，所以是{aged.call}。</p> : !sure && <AnswerNotes kid={answer.kid} />}
            {!aged && formalNote(answer.formal, names) && <p className="tr-note">也可以叫：{formalNote(answer.formal, names)}</p>}
            {back && <p className="tr-back">TA 叫你：<b>{back}</b></p>}
            {known && known.level > 0 && <DadSays>{known.tip}</DadSays>}
            {known && (
              <button type="button" className="pill-btn" onClick={() => onTree(known.id)}>🌳 去家族树里找 TA</button>
            )}
          </>
        )}
      </section>

      <section aria-labelledby="train-examples">
        <h2 id="train-examples" className="section-title is-small">试试这几趟车</h2>
        <div className="chips">
          {examples.map((example) => (
            <button key={stepsText(example)} type="button" onClick={() => set(example)}>{stepsText(example)}</button>
          ))}
        </div>
      </section>
    </div>
  );
}

function AnswerNotes({ kid }: { kid: readonly string[] }) {
  if (kid.length < 2) return null;
  if (kid.includes("你自己")) return <p className="tr-note">脑筋急转弯：TA 可能是你的兄弟姐妹，也可能就是你自己！</p>;
  if (kid.length === 2) return <p className="tr-note">要看 TA 比你大还是比你小：大的叫{kid[0]}，小的叫{kid[1]}。</p>;
  return <p className="tr-note">有好几种可能，要看具体是哪一位。</p>;
}

function formalNote(formal: readonly string[], kid: readonly string[]) {
  const differs = formal.filter((name) => !kid.includes(name) && name !== "自己");
  return differs.length ? differs.join("、") : "";
}
