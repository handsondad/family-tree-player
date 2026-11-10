import { useEffect, useRef, useState } from "react";
import { DadSays, Person, SpeakButton, TopBar, calledMeText, meEmoji, type Settings } from "../components/Shared";
import { relativeById, relativeBySteps, relatives, sideNames, type Relative, type Step } from "../data/relatives";
import { dadLines } from "../data/lines";
import { dad, nian, say } from "../lib/speech";

/** 坐标在 1000 × 580 的画布里。 */
const nodes: readonly { id: string; x: number; y: number }[] = [
  { id: "yeye", x: 230, y: 80 }, { id: "nainai", x: 340, y: 80 },
  { id: "waigong", x: 660, y: 80 }, { id: "waipo", x: 770, y: 80 },
  { id: "bobo", x: 80, y: 280 }, { id: "gugu", x: 210, y: 280 }, { id: "dad", x: 390, y: 280 },
  { id: "mom", x: 610, y: 280 }, { id: "jiujiu", x: 790, y: 280 }, { id: "yima", x: 920, y: 280 },
  { id: "tangge", x: 80, y: 470 }, { id: "biaojie", x: 210, y: 470 }, { id: "me", x: 500, y: 470 },
  { id: "biaodi", x: 790, y: 470 }, { id: "biaomei", x: 920, y: 470 }
];

const lines = [
  "M285 80 V180 M80 180 H390 M80 180 V280 M210 180 V280 M390 180 V280",
  "M715 80 V180 M610 180 H920 M610 180 V280 M790 180 V280 M920 180 V280",
  "M500 280 V470",
  "M80 280 V470 M210 280 V470 M790 280 V470 M920 280 V470"
];
const couples = [[230, 340, 80], [660, 770, 80], [390, 610, 280]] as const;

const inTree = new Set(nodes.map((node) => node.id));

/** 从我走到 TA，路上经过的人，按第几步编号。 */
function pathOf(relative: Relative | undefined): Map<string, number> {
  const path = new Map<string, number>();
  if (!relative) return path;
  relative.steps.forEach((_, i) => {
    const stop = relativeBySteps(relative.steps.slice(0, i + 1));
    if (stop) path.set(stop.id, i + 1);
  });
  return path;
}

const familyOf = (steps: readonly Step[]) =>
  relatives.filter((other) => other.steps.length === steps.length + 1 && steps.every((step, i) => other.steps[i] === step));

type Props = {
  initialId?: string;
  settings: Settings;
  met: readonly string[];
  onMeet: (id: string) => void;
  onBack: () => void;
  onTrain: (steps: readonly Step[]) => void;
};

export function TreePage({ initialId, settings, met, onMeet, onBack, onTrain }: Props) {
  const [selected, setSelected] = useState(() => relativeById(initialId)?.id ?? "me");
  const [hide, setHide] = useState(false);
  const [revealed, setRevealed] = useState<readonly string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const relative = relativeById(selected);
  const path = pathOf(relative);
  const known = relatives.filter((item) => met.includes(item.id)).length;
  const shown = (id: string) => !hide || revealed.includes(id);

  useEffect(() => {
    const el = scrollRef.current;
    const focus = nodes.find((node) => node.id === selected) ?? nodes.find((node) => node.id === "me")!;
    if (el) el.scrollLeft = (focus.x / 1000) * el.scrollWidth - el.clientWidth / 2;
  }, []);

  useEffect(() => {
    if (relative && !hide) onMeet(relative.id);
  }, [selected, hide]);

  function pick(id: string, scroll = false) {
    setSelected(id);
    const next = relativeById(id);
    if (next && settings.sound && shown(id)) say(nian(next.call), dad(next.tip));
    if (scroll) cardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function reveal(item: Relative) {
    setRevealed((list) => [...list, item.id]);
    onMeet(item.id);
    if (settings.sound) say(nian(item.call), dad(item.tip));
  }

  function toggleHide() {
    setHide(!hide);
    setRevealed([]);
  }

  return (
    <div className="page tree-page">
      <TopBar emoji="🌳" title="我家的家族树" onBack={onBack} settings={settings} />

      <div className="intro">
        <p><span aria-hidden="true">👆</span>这是一个大家族的样子。点任何一个人，看看该怎么叫 TA。</p>
        <p><span aria-hidden="true">⭐</span>你已经认识了 <b>{known} / {relatives.length}</b> 位亲戚，树上没画出来的，可以从卡片里的“TA 的家人”找到。</p>
        <button type="button" className="pill-btn" aria-pressed={hide} onClick={toggleHide}>
          {hide ? "🙉 把名字露出来" : "🙈 把名字藏起来，考考我"}
        </button>
      </div>

      <div className="tree-layout">
        <div className="tree-scroll" ref={scrollRef}>
          <div className="tree" role="group" aria-label="家族树">
            <svg viewBox="0 0 1000 580" aria-hidden="true">
              <rect className="zone is-dad" x="10" y="10" width="480" height="560" rx="34" />
              <rect className="zone is-mom" x="510" y="10" width="480" height="560" rx="34" />
              <text className="zone-label is-dad" x="34" y="44">爸爸家</text>
              <text className="zone-label is-mom" x="966" y="44" textAnchor="end">妈妈家</text>
              {lines.map((d) => <path key={d} className="tree-line" d={d} />)}
              {couples.map(([a, b, y]) => (
                <g key={`${a}-${b}`}>
                  <path className="tree-couple" d={`M${a} ${y} H${b}`} />
                  <text className="tree-heart" x={(a + b) / 2} y={y + 7} textAnchor="middle">❤</text>
                </g>
              ))}
            </svg>
            {nodes.map((node) => {
              const item = relativeById(node.id);
              const isMe = node.id === "me";
              const step = path.get(node.id);
              const label = isMe ? "我" : shown(node.id) ? item!.call : "？";
              return (
                <button key={node.id} type="button"
                  className={`tree-node${selected === node.id ? " is-selected" : ""}${step ? " is-path" : ""}`}
                  style={{ left: `${node.x / 10}%`, top: `${(node.y / 580) * 100}%` }}
                  aria-pressed={selected === node.id} aria-label={isMe ? "我自己" : shown(node.id) ? item!.call : "一位还没揭晓的亲戚"}
                  onClick={() => pick(node.id, true)}>
                  <Person emoji={isMe ? meEmoji : item!.emoji} side={isMe ? "home" : item!.side}>
                    {step && <span className="path-badge">{step}</span>}
                    {!isMe && met.includes(node.id) && <span className="met-badge">⭐</span>}
                  </Person>
                  <span className="tree-name">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <section ref={cardRef} className="card relative-card" aria-live="polite" aria-label="这个人怎么叫">
          {relative ? (
            <RelativeCard relative={relative} settings={settings} hidden={!shown(relative.id)} hideAll={hide}
              onReveal={() => reveal(relative)} onPick={(id) => pick(id)} onTrain={onTrain} />
          ) : (
            <MeCard settings={settings} onPick={(id) => pick(id)} />
          )}
        </section>
      </div>
    </div>
  );
}

function MeCard({ settings, onPick }: { settings: Settings; onPick: (id: string) => void }) {
  return (
    <>
      <div className="rc-head">
        <Person emoji={meEmoji} side="home" size="lg" />
        <div>
          <small>这就是你</small>
          <strong className="rc-call">小念</strong>
        </div>
      </div>
      <DadSays>{dadLines.treeMe}</DadSays>
      <FamilyChips steps={[]} onPick={onPick} named={false} />
    </>
  );
}

type CardProps = {
  relative: Relative;
  settings: Settings;
  hidden: boolean;
  hideAll: boolean;
  onReveal: () => void;
  onPick: (id: string) => void;
  onTrain: (steps: readonly Step[]) => void;
};

function RelativeCard({ relative, settings, hidden, hideAll, onReveal, onPick, onTrain }: CardProps) {
  const parent = relativeBySteps(relative.steps.slice(0, -1));
  const back = calledMeText(relative);
  return (
    <>
      <div className="rc-head">
        <Person emoji={relative.emoji} side={relative.side} size="lg" />
        <div>
          <small>你叫{relative.male ? "他" : "她"}</small>
          {hidden ? (
            <button type="button" className="primary-btn" onClick={onReveal}>先猜一猜，再点我揭晓</button>
          ) : (
            <strong className="rc-call">{relative.call} <SpeakButton who="nian" text={relative.call} label={`听小念叫：${relative.call}`} /></strong>
          )}
        </div>
        <span className="side-tag" data-side={relative.side}>{sideNames[relative.side]}</span>
      </div>

      <ol className="rc-chain" aria-label="从你出发怎么找到 TA">
        <li>我</li>
        {relative.steps.map((step, i) => <li key={i}>的{step}</li>)}
        {relative.age && <li className="is-note">{relative.age === "older" ? "比你大" : "比你小"}</li>}
      </ol>

      {!hidden && (
        <>
          <p className="rc-back">{relative.male ? "他" : "她"}叫你：<b>{back}</b></p>
          {relative.also && <p className="rc-also">也有人叫：{relative.also.join("、")}</p>}
          <DadSays>{relative.tip}</DadSays>
        </>
      )}

      {!inTree.has(relative.id) && parent && (
        <p className="rc-note">树上没画{relative.male ? "他" : "她"}，{relative.male ? "他" : "她"}是{parent.call}的{relative.steps[relative.steps.length - 1]}。</p>
      )}
      <FamilyChips steps={relative.steps} onPick={onPick} parent={parent ?? (relative.steps.length === 1 ? "me" : undefined)} named={!hideAll} />

      <div className="rc-actions">
        <button type="button" className="pill-btn" onClick={() => onTrain(relative.steps)}>🚂 去小火车里拼一拼</button>
      </div>
    </>
  );
}

type ChipsProps = { steps: readonly Step[]; onPick: (id: string) => void; parent?: Relative | "me"; named: boolean };

function FamilyChips({ steps, onPick, parent, named }: ChipsProps) {
  const family = familyOf(steps);
  if (!family.length && !parent) return null;
  return (
    <div className="rc-family">
      <h3>{steps.length ? "TA 的家人" : "你的家人"}</h3>
      <div className="chips">
        {parent && (
          <button type="button" onClick={() => onPick(parent === "me" ? "me" : parent.id)}>
            ← {parent === "me" ? "回到我" : named ? `回到${parent.call}` : "往回走一步"}
          </button>
        )}
        {family.map((other) => (
          <button key={other.id} type="button" onClick={() => onPick(other.id)}>
            <span aria-hidden="true">{other.emoji}</span> {steps.length ? "TA" : "我"}的{other.steps[other.steps.length - 1]}
            {named && <b> · {other.call}</b>}
          </button>
        ))}
      </div>
    </div>
  );
}
