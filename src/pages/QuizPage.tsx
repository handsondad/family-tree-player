import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Stars } from "../App";
import { Burst, starRow } from "../components/GameKit";
import { DadSays, Person, SpeakButton, TopBar, type Settings } from "../components/Shared";
import { levels, me, type QuizLevel, type Relative } from "../data/relatives";
import { doneLines, rightLine } from "../data/lines";
import { explain, makeRound, starsFor, wrongLine, type Question } from "../lib/quiz";
import { chime, dad, nian, say } from "../lib/speech";

type HomeProps = { settings: Settings; stars: Stars; onBack: () => void; onPlay: (level: QuizLevel) => void };

export function QuizHome({ settings, stars, onBack, onPlay }: HomeProps) {
  return (
    <div className="page quiz-page">
      <TopBar emoji="🏆" title="称呼大闯关" onBack={onBack} settings={settings} />
      <div className="intro">
        <p><span aria-hidden="true">🎯</span>每一关随机出题，选一个你觉得对的。答错了也没关系，爸爸会告诉你为什么。</p>
        <p><span aria-hidden="true">⭐</span>答对得越多星星越多，每一关记住你最好的一次。</p>
      </div>

      <div className="levels">
        {levels.map(({ level, title, emoji, hook, count }) => (
          <button key={level} type="button" className="level-card" onClick={() => onPlay(level)}
            style={{ "--bubble": ["#6bcb77", "#4d96ff", "#a66cff"][level - 1] } as CSSProperties}>
            <span className="level-emoji" aria-hidden="true">{emoji}</span>
            <strong>第 {level} 关 · {title}</strong>
            <small>{hook}</small>
            <span className="level-stars" aria-label={`最好成绩 ${stars[level] ?? 0} 颗星`}>{starRow(stars[level] ?? 0)}</span>
            <span className="level-count">{count} 道题 →</span>
          </button>
        ))}
      </div>
    </div>
  );
}

type PlayProps = {
  level: QuizLevel;
  settings: Settings;
  onBack: () => void;
  onAgain: () => void;
  onNext: (level: QuizLevel) => void;
  onTree: (id: string) => void;
  onFinish: (level: QuizLevel, stars: number) => void;
};

export function QuizPlay({ level, settings, onBack, onAgain, onNext, onTree, onFinish }: PlayProps) {
  const [questions] = useState(() => makeRound(level, me));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [missed, setMissed] = useState<readonly Relative[]>([]);
  const [done, setDone] = useState(false);
  const info = levels.find((item) => item.level === level)!;
  const question = questions[index];
  const score = index + (picked ? 1 : 0) - missed.length;

  const later = useRef(0);

  useEffect(() => {
    if (settings.sound && !done) say(dad(question.prompt));
    return () => window.clearTimeout(later.current);
  }, [index]);

  function choose(option: string) {
    if (picked) return;
    setPicked(option);
    const right = option === question.answer;
    if (!right) setMissed([...missed, question.relative]);
    if (settings.sound) {
      chime(right);
      later.current = window.setTimeout(() => say(right ? nian(rightLine) : dad(wrongLine(question.answer)), dad(explain(question))), 350);
    }
  }

  function next() {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setPicked(null);
      return;
    }
    const stars = starsFor(score, questions.length);
    setDone(true);
    onFinish(level, stars);
    if (settings.sound) say(dad(doneLines[stars - 1]));
  }

  if (done) {
    const stars = starsFor(score, questions.length);
    const nextLevel = levels.find((item) => item.level === level + 1);
    return (
      <div className="page quiz-page">
        <TopBar emoji="🏆" title={`第 ${level} 关 · ${info.title}`} onBack={onBack} backLabel="选关" settings={settings} />
        <section className="card quiz-done" aria-labelledby="quiz-done-title">
          <p className="done-stars" aria-hidden="true">{starRow(stars)}</p>
          <h2 id="quiz-done-title">答对了 {score} / {questions.length} 题</h2>
          <DadSays>{doneLines[stars - 1]}</DadSays>
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
            <button type="button" className={nextLevel ? "pill-btn" : "primary-btn"} onClick={onAgain}>🔁 再玩一次</button>
            {nextLevel ? (
              <button type="button" className="primary-btn" onClick={() => onNext(nextLevel.level)}>下一关：{nextLevel.title} →</button>
            ) : (
              <button type="button" className="pill-btn" onClick={onBack}>← 返回选关</button>
            )}
          </div>
        </section>
      </div>
    );
  }

  const right = picked === question.answer;
  return (
    <div className="page quiz-page">
      <TopBar emoji="🏆" title={`第 ${level} 关 · ${info.title}`} onBack={onBack} backLabel="选关" settings={settings} />

      <div className="quiz-progress" aria-label={`第 ${index + 1} 题，共 ${questions.length} 题`}>
        <div className="quiz-dots" aria-hidden="true">
          {questions.map((item, i) => {
            const dotState = i < index
              ? (missed.some((m) => m.id === item.relative.id) ? "is-wrong" : "is-right")
              : i === index
                ? (picked ? (right ? "is-right is-now" : "is-wrong is-now") : "is-now")
                : "";
            return <span key={item.key} className={dotState} />;
          })}
        </div>
        <small aria-hidden="true">第 {index + 1} / {questions.length} 题</small>
      </div>

      <section className="card quiz-card" aria-labelledby="quiz-prompt">
        <QuestionFigure question={question} answered={!!picked} />
        <h2 id="quiz-prompt" className="quiz-prompt">
          {question.prompt} <SpeakButton who="dad" text={question.prompt} label="听爸爸读题" />
        </h2>
        <div className={`options${question.kind === "who" ? " is-long" : ""}`}>
          {question.options.map((option) => {
            const state = !picked ? "" : option === question.answer ? " is-right" : option === picked ? " is-wrong" : " is-dim";
            return (
              <button key={option} type="button" className={`option${state}`} disabled={!!picked && option !== picked && option !== question.answer}
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
            <p className={`verdict${right ? " is-right" : " is-wrong"}`}>{right ? "🎉 答对啦！" : `😮 差一点！答案是「${question.answer}」`}</p>
            <DadSays>{explain(question)}</DadSays>
            <button type="button" className="primary-btn" onClick={next} autoFocus>
              {index + 1 < questions.length ? "下一题 →" : "看看我得了几颗星 →"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function QuestionFigure({ question, answered }: { question: Question; answered: boolean }) {
  const { relative, kind } = question;
  return (
    <div className="quiz-figure" aria-hidden="true">
      <Person emoji={relative.emoji} side={relative.side} size="lg">
        {!answered && kind !== "calledMe" && <span className="figure-q">?</span>}
      </Person>
      {kind === "calledMe" && <span className="figure-bubble">我该叫你……</span>}
      {answered && <span className="figure-name">{relative.call}</span>}
    </div>
  );
}
