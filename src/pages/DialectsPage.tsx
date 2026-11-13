import { useState, type CSSProperties } from "react";
import { DadSays, Person, SpeakButton, TopBar, type Settings } from "../components/Shared";
import {
  dialectEntries, dialectGroups, dialectRegions, dialectTraps, trapSpeech, type DialectEntry, type DialectGroupId
} from "../data/dialects";
import { relativeById } from "../data/relatives";
import { dad, say } from "../lib/speech";

type Props = {
  settings: Settings;
  onBack: () => void;
  onTree: (id: string) => void;
};

export function DialectsPage({ settings, onBack, onTree }: Props) {
  const [group, setGroup] = useState<DialectGroupId>("grand");
  const [selectedId, setSelectedId] = useState("waipo");
  const [focusRegion, setFocusRegion] = useState<string | null>(null);

  const entries = dialectEntries.filter((item) => item.group === group);
  const current: DialectEntry = dialectEntries.find((item) => item.id === selectedId) ?? entries[0];
  const relative = relativeById(current.relativeId);

  function pickGroup(nextGroup: DialectGroupId) {
    setGroup(nextGroup);
    const first = dialectEntries.find((item) => item.group === nextGroup)!;
    setSelectedId(first.id);
    if (settings.sound) say(dad(first.dadNote));
  }

  function pickEntry(entry: DialectEntry) {
    setSelectedId(entry.id);
    if (settings.sound) say(dad(entry.dadNote));
  }

  return (
    <div className="page dialects-page">
      <TopBar emoji="🗺️" title="各地叫法大不同" onBack={onBack} settings={settings} />

      <div className="intro">
        <p><span aria-hidden="true">🌏</span>中国很大，同一位亲戚在南北方、不同方言里叫法大不相同！</p>
        <p><span aria-hidden="true">👆</span>先选一位亲戚，看看八大方言区怎么喊；也可以点地区标签高亮你老家的叫法。</p>
      </div>

      <div className="dialect-groups" role="tablist" aria-label="亲戚分类">
        {dialectGroups.map((item) => (
          <button key={item.id} type="button" className="pill-btn" aria-pressed={group === item.id}
            onClick={() => pickGroup(item.id)}>
            <span aria-hidden="true">{item.emoji}</span> {item.title}
          </button>
        ))}
      </div>

      <div className="dialect-people" role="group" aria-label="选择一位亲戚">
        {entries.map((entry) => {
          const rel = relativeById(entry.relativeId);
          return (
            <button key={entry.id} type="button" className={`dialect-person${entry.id === current.id ? " is-active" : ""}`}
              onClick={() => pickEntry(entry)}>
              <Person emoji={entry.emoji} side={rel?.side ?? "home"} size="sm" />
              <div>
                <strong>{entry.calls.mandarin}</strong>
                <small>{entry.chain}</small>
              </div>
            </button>
          );
        })}
      </div>

      <section className="card dialect-board" aria-live="polite" aria-labelledby="dialect-current-title">
        <div className="dialect-head">
          <Person emoji={current.emoji} side={relative?.side ?? "home"} size="lg" />
          <div>
            <small>{current.chain}</small>
            <h2 id="dialect-current-title">{current.calls.mandarin}</h2>
          </div>
          {relative && (
            <button type="button" className="pill-btn" onClick={() => onTree(relative.id)}>🌳 去家族树看{relative.male ? "他" : "她"}</button>
          )}
        </div>

        <DadSays>{current.dadNote}</DadSays>

        <div className="dialect-filter" aria-label="高亮某个方言区">
          <span>点地区看老家：</span>
          {dialectRegions.map((region) => (
            <button key={region.id} type="button" aria-pressed={focusRegion === region.id}
              onClick={() => setFocusRegion(focusRegion === region.id ? null : region.id)}>
              {region.emoji} {region.name}
            </button>
          ))}
        </div>

        <div className="dialect-grid">
          {dialectRegions.map((region) => {
            const focused = focusRegion === region.id;
            const dimmed = focusRegion !== null && !focused;
            return (
              <div key={region.id} className={`dialect-tile${focused ? " is-focus" : ""}${dimmed ? " is-dim" : ""}`}
                style={{ "--bubble": region.color } as CSSProperties}>
                <span className="dt-top">
                  <span><i aria-hidden="true">{region.emoji}</i> {region.name}</span>
                  <small>{region.area}</small>
                </span>
                <strong className="dt-call">{current.calls[region.id]}</strong>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="dialect-traps-title">
        <h2 id="dialect-traps-title" className="section-title">🤭 跨省走亲戚 · 别闹笑话小锦囊</h2>
        <div className="traps-grid">
          {dialectTraps.map((trap, i) => (
            <article key={trap.word} className="tip-card trap-card" style={{ "--i": i } as CSSProperties}>
              <span aria-hidden="true">{trap.emoji}</span>
              <div>
                <h3>{trap.title} <SpeakButton who="dad" text={trapSpeech(trap)} label={`听爸爸讲：${trap.title}`} /></h3>
                <p>{trap.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
