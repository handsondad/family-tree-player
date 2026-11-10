import relationship from "../vendor/relationship/index.ts";
import type { Sex, Step } from "../data/relatives.ts";

/** 库给的是书面称呼，这里换成孩子平时说的。 */
const kidAlias: Record<string, string> = {
  伯父: "伯伯", 叔父: "叔叔", 姑妈: "姑姑",
  姑丈: "姑父", 大姑丈: "姑父", 小姑丈: "姑父",
  姨丈: "姨父", 大姨丈: "姨父", 小姨丈: "姨父",
  大舅妈: "舅妈", 小舅妈: "舅妈",
  曾祖父: "太爷爷", 曾祖母: "太奶奶", 伯公: "大爷爷", 叔公: "小爷爷",
  夫侄子: "侄子", 夫侄女: "侄女", 妻侄子: "侄子", 妻侄女: "侄女",
  姑甥: "外甥", 姑甥女: "外甥女", 姨甥: "外甥", 姨甥女: "外甥女",
  姨哥: "表哥", 姨弟: "表弟", 姨姐: "表姐", 姨妹: "表妹",
  自己: "你自己"
};

export function kidName(title: string): string {
  return kidAlias[title] ?? title.replace(/^[姑舅]表(?=[哥姐弟妹]$)/, "表");
}

const unique = (list: readonly string[]) => [...new Set(list)];

export type Answer = {
  /** 孩子的叫法，可能有几个（如堂哥 / 堂弟，要看年龄）。 */
  kid: string[];
  /** 库给的书面叫法。 */
  formal: string[];
};

function query(steps: readonly Step[], sex: Sex | null, reverse: boolean): Answer {
  if (!steps.length) return { kid: [], formal: [] };
  const formal = relationship({ text: steps.join("的"), sex: sex ?? -1, reverse });
  return { kid: unique(formal.map(kidName)), formal };
}

/** 我叫 TA 什么。 */
export const callOf = (steps: readonly Step[], sex: Sex | null) => query(steps, sex, false);

/** TA 叫我什么。 */
export const calledBy = (steps: readonly Step[], sex: Sex | null) => query(steps, sex, true);

const maleSteps: ReadonlySet<Step> = new Set(["爸爸", "哥哥", "弟弟", "儿子", "老公"]);

export const isMaleStep = (step: Step) => maleSteps.has(step);
