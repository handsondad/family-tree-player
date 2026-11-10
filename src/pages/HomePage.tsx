import { useRef, useState, type CSSProperties } from "react";
import type { Best, Stars } from "../App";
import { Avatar } from "../components/Avatar";
import { starRow } from "../components/GameKit";
import { SpeakButton } from "../components/Shared";
import { levels, relatives } from "../data/relatives";
import { chats } from "../data/lines";
import { tipSpeech, tips } from "../data/tips";
import type { GameId } from "../lib/games";
import { dad, isSpeaking, nian, say, useSpeaking } from "../lib/speech";

type Props = {
  met: readonly string[];
  stars: Stars;
  best: Best;
  onTree: () => void;
  onTrain: () => void;
  onGo: (hash: string) => void;
};

export function HomePage({ met, stars, best, onTree, onTrain, onGo }: Props) {
  const [chat, setChat] = useState(0);
  const [nianLine, dadLine] = chats[chat];
  const speaking = useSpeaking();
  const total = relatives.length;
  const known = relatives.filter((relative) => met.includes(relative.id)).length;
  const starCount = levels.reduce((sum, { level }) => sum + (stars[level] ?? 0), 0);

  /** 第一次点先把眼前这一段说出来，之后每点一次换下一段。 */
  const heard = useRef(false);

  function talk() {
    const next = heard.current ? (chat + 1) % chats.length : chat;
    heard.current = true;
    setChat(next);
    say(nian(chats[next][0]), dad(chats[next][1]));
  }

  const bestOf = (game: GameId) => (best[game] ? starRow(best[game]) : "还没玩过");

  const learn: Mode[] = [
    { emoji: "🌳", title: "我家的家族树", hook: "点一点每个人，看看该怎么叫 TA、TA 又怎么叫你。", count: `认识了 ${known} / ${total} 位亲戚`, color: "#6bcb77", onClick: onTree },
    { emoji: "🚂", title: "称呼小火车", hook: "“爸爸的妈妈的哥哥”是谁？一节一节挂上车厢就知道。", count: "随便拼，还能让小火车出题考你", color: "#4d96ff", onClick: onTrain }
  ];
  const play: Mode[] = [
    { emoji: "🏆", title: "称呼大闯关", hook: "入门、进阶、挑战三关，看你能拿几颗星。", count: `⭐ ${starCount} / ${levels.length * 3}`, color: "#ff9f43", onClick: () => onGo("#/quiz") },
    { emoji: "🧧", title: "过年拜年", hook: "亲戚一个个来敲门，叫对了就有红包。", count: bestOf("door"), color: "#ff6b6b", onClick: () => onGo("#/door") },
    { emoji: "🪜", title: "辈分排排站", hook: "爷爷辈、爸爸辈、我这辈……把亲戚送到对的那一排。", count: bestOf("rows"), color: "#a66cff", onClick: () => onGo("#/rows") },
    { emoji: "🏠", title: "爸爸家还是妈妈家", hook: "亲戚一个个掉下来，快分到爸爸家或者妈妈家。", count: bestOf("sides"), color: "#4dc3c3", onClick: () => onGo("#/sides") },
    { emoji: "🃏", title: "翻牌配对", hook: "一张写着是谁，一张写着叫什么，翻开配成一对。", count: bestOf("match"), color: "#ffb347", onClick: () => onGo("#/match") }
  ];

  return (
    <div className="page home">
      <header className="home-title">
        <h1><span aria-hidden="true">🌳</span> 认亲戚大冒险</h1>
        <p>小念和爸爸带你认识一大家子</p>
      </header>

      <section aria-labelledby="home-duo-title">
        <h2 id="home-duo-title" className="section-title">小念和爸爸</h2>
        <div className="duo">
          <button type="button" className={`duo-bubble is-nian${isSpeaking(speaking, "nian", nianLine) ? " is-speaking" : ""}`} onClick={talk}><b>小念</b>{nianLine}</button>
          <button type="button" className={`duo-bubble is-dad${isSpeaking(speaking, "dad", dadLine) ? " is-speaking" : ""}`} onClick={talk}><b>爸爸</b>{dadLine}</button>
          <button type="button" className="duo-people" onClick={talk} aria-label="点一下，小念和爸爸接着聊">
            <span className="duo-dad"><Avatar who="dad" /></span>
            <span className="duo-nian"><Avatar who="nian" /></span>
          </button>
          <span className="duo-hint" aria-hidden="true">点他们，接着聊 👆</span>
        </div>
      </section>

      <Modes id="home-learn-title" title="认一认" modes={learn} />
      <Modes id="home-play-title" title="玩一玩" modes={play} />

      <section aria-labelledby="home-tips-title">
        <h2 id="home-tips-title" className="section-title">爸爸的认亲口诀</h2>
        <div className="tips">
          {tips.map((tip, i) => (
            <article key={tip.title} className="tip-card" style={{ "--i": i } as CSSProperties}>
              <span aria-hidden="true">{tip.emoji}</span>
              <div>
                <h3>{tip.title} <SpeakButton who="dad" text={tipSpeech(tip)} label={`听爸爸讲：${tip.title}`} /></h3>
                <p>{tip.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

type Mode = { emoji: string; title: string; hook: string; count: string; color: string; onClick: () => void };

function Modes({ id, title, modes }: { id: string; title: string; modes: readonly Mode[] }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="section-title">{title}</h2>
      <div className="modes">
        {modes.map((mode) => (
          <button key={mode.title} type="button" className="mode-card" style={{ "--bubble": mode.color } as CSSProperties} onClick={mode.onClick}>
            <span className="mode-emoji" aria-hidden="true">{mode.emoji}</span>
            <strong>{mode.title}</strong>
            <small>{mode.hook}</small>
            <span className="mode-count">{mode.count} →</span>
          </button>
        ))}
      </div>
    </section>
  );
}
