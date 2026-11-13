import { useEffect, useRef, type CSSProperties } from "react";
import { Avatar } from "../components/Avatar";
import { SpeakButton, TopBar, type Settings } from "../components/Shared";
import { relativeById } from "../data/relatives";
import { stories, type Story, type StoryTurn } from "../data/stories";
import { dad, isSpeaking, nian, say, stopSpeaking, useSpeaking } from "../lib/speech";

type ListProps = {
  settings: Settings;
  readIds: readonly string[];
  onBack: () => void;
  onOpen: (id: string) => void;
};

export function StoriesHome({ settings, readIds, onBack, onOpen }: ListProps) {
  const readCount = stories.filter((story) => readIds.includes(story.id)).length;
  return (
    <div className="page stories-page">
      <TopBar emoji="📖" title="小念问爸爸" onBack={onBack} settings={settings} />

      <div className="intro">
        <p><span aria-hidden="true">💡</span>中国人的亲戚称呼里，藏着几千年的家族故事和汉字密码。</p>
        <p><span aria-hidden="true">🎧</span>已经听过 <b>{readCount} / {stories.length}</b> 个故事，点开任意一个，听小念和爸爸一问一答聊到底。</p>
      </div>

      <div className="story-grid">
        {stories.map((story) => {
          const done = readIds.includes(story.id);
          return (
            <button key={story.id} type="button" className={`story-card${done ? " is-read" : ""}`}
              style={{ "--bubble": story.color } as CSSProperties} onClick={() => onOpen(story.id)}>
              <span className="story-emoji" aria-hidden="true">{story.emoji}</span>
              <div className="story-body">
                <span className="story-meta">
                  <em>{story.tag}</em>
                  <em>💬 {story.turns.length} 问 {story.turns.length} 答</em>
                  {done && <em className="is-done">⭐ 读过</em>}
                </span>
                <strong>{story.title}</strong>
                <small>{story.trigger}</small>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type DetailProps = {
  story: Story;
  settings: Settings;
  readIds: readonly string[];
  onRead: (id: string) => void;
  onBack: () => void;
  onOpen: (id: string) => void;
  onTree: (id: string) => void;
};

export function StoryPage({ story, settings, readIds, onRead, onBack, onOpen, onTree }: DetailProps) {
  const speaking = useSpeaking();
  const turnRefs = useRef<(HTMLDivElement | null)[]>([]);
  const allLines = story.turns.flatMap((turn) => [nian(turn.nian), dad(turn.dad)]);
  const playingAny = speaking !== null && allLines.some((line) => isSpeaking(speaking, line.who, line.text));
  const others = stories.filter((item) => item.id !== story.id);

  useEffect(() => {
    onRead(story.id);
    if (settings.sound) say(...allLines);
  }, [story.id]);

  useEffect(() => {
    if (!speaking) return;
    const idx = story.turns.findIndex((turn) => isSpeaking(speaking, "nian", turn.nian) || isSpeaking(speaking, "dad", turn.dad));
    if (idx >= 0) turnRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [speaking, story]);

  function togglePlayAll() {
    if (playingAny) stopSpeaking();
    else say(...allLines);
  }

  return (
    <div className="page stories-page">
      <TopBar emoji={story.emoji} title="小念问爸爸" onBack={onBack} backLabel="问题列表" settings={settings} />

      <article className="story-main" style={{ "--bubble": story.color } as CSSProperties}>
        <header className="card story-head">
          <div className="story-head-top">
            <span className="story-tag">{story.emoji} {story.tag}</span>
            <button type="button" className={`primary-btn story-play-btn${playingAny ? " is-playing" : ""}`} onClick={togglePlayAll}>
              {playingAny ? "⏹ 停止连播" : "▶ 从头听一遍"}
            </button>
          </div>
          <h2>{story.title}</h2>
          <p>{story.trigger}</p>
        </header>

        <div className="qa-chat">
          {story.turns.map((turn, i) => (
            <TurnBlock key={i} turn={turn} index={i} speaking={speaking}
              setRef={(el) => { turnRefs.current[i] = el; }} />
          ))}
        </div>

        {story.relatedIds.length > 0 && (
          <section className="card story-related" aria-labelledby="story-rel-title">
            <h3 id="story-rel-title">🌳 去家族树里认识刚聊到的亲戚</h3>
            <div className="chips">
              {story.relatedIds.map((id) => {
                const rel = relativeById(id);
                if (!rel) return null;
                return (
                  <button key={id} type="button" onClick={() => onTree(id)}>
                    <span aria-hidden="true">{rel.emoji}</span> {rel.call}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section className="story-more" aria-labelledby="story-more-title">
          <h3 id="story-more-title" className="section-title is-small">接着问下一个问题</h3>
          <div className="story-next-grid">
            {others.slice(0, 3).map((item) => (
              <button key={item.id} type="button" className={`story-mini${readIds.includes(item.id) ? " is-read" : ""}`}
                style={{ "--bubble": item.color } as CSSProperties} onClick={() => onOpen(item.id)}>
                <span aria-hidden="true">{item.emoji}</span>
                <strong>{item.title}</strong>
              </button>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}

type TurnProps = {
  turn: StoryTurn;
  index: number;
  speaking: ReturnType<typeof useSpeaking>;
  setRef: (el: HTMLDivElement | null) => void;
};

function TurnBlock({ turn, index, speaking, setRef }: TurnProps) {
  const nianActive = isSpeaking(speaking, "nian", turn.nian);
  const dadActive = isSpeaking(speaking, "dad", turn.dad);
  return (
    <div ref={setRef} className="qa-turn" style={{ "--i": index } as CSSProperties}>
      <div className={`qa-line is-nian${nianActive ? " is-speaking" : ""}`}>
        <span className="qa-avatar"><Avatar who="nian" /></span>
        <div className="qa-bubble">
          <b className="qa-who">小念问 <SpeakButton who="nian" text={turn.nian} label="听小念问" /></b>
          <p>{turn.nian}</p>
        </div>
      </div>

      <div className={`qa-line is-dad${dadActive ? " is-speaking" : ""}`}>
        <span className="qa-avatar"><Avatar who="dad" /></span>
        <div className="qa-bubble">
          <b className="qa-who">爸爸答 <SpeakButton who="dad" text={turn.dad} label="听爸爸答" /></b>
          <p>{turn.dad}</p>
          {turn.steps && (
            <ol className="qa-steps" aria-label="图解要点">
              {turn.steps.map((frame, k) => (
                <li key={frame.label} style={{ "--k": k } as CSSProperties}>
                  <span aria-hidden="true">{frame.icon}</span>
                  <small>{frame.label}</small>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
