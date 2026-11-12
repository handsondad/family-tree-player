import { relativeBySteps, relatives, stepsText, type Relative, type Sex, type Step } from "../data/relatives.ts";
import { callOf, isMaleStep } from "./kinship.ts";

export const stepButtons: readonly { step: Step; emoji: string }[] = [
  { step: "爸爸", emoji: "👨" }, { step: "妈妈", emoji: "👩" },
  { step: "哥哥", emoji: "👦" }, { step: "姐姐", emoji: "👧" },
  { step: "弟弟", emoji: "🧒" }, { step: "妹妹", emoji: "👶" },
  { step: "老公", emoji: "🤵" }, { step: "老婆", emoji: "👰" },
  { step: "儿子", emoji: "👦" }, { step: "女儿", emoji: "👧" }
];

export const emojiOf = new Map(stepButtons.map(({ step, emoji }) => [step, emoji]));

export const isStep = (value: string): value is Step => emojiOf.has(value as Step);

export const maxCars = 5;

export const examples: readonly Step[][] = [
  ["爸爸", "老婆"],
  ["妈妈", "妈妈", "哥哥"],
  ["爸爸", "儿子"],
  ["爸爸", "爸爸", "爸爸"],
  ["姐姐", "女儿"],
  ["妈妈", "姐姐", "老公"]
];

/** 小朋友自己还没有老公老婆和孩子；老公老婆还要看上一个人是男是女。 */
export function blocked(step: Step, steps: readonly Step[]): string | null {
  if (steps.length >= maxCars) return "车厢挂满啦";
  const last = steps[steps.length - 1];
  if (!last) return ["老公", "老婆", "儿子", "女儿"].includes(step) ? "小朋友还没有自己的家哦" : null;
  if (step === "老公" && isMaleStep(last)) return `${last}是男的，要选老婆`;
  if (step === "老婆" && !isMaleStep(last)) return `${last}是女的，要选老公`;
  return null;
}

export const guessPool = relatives.filter((relative) => relative.level >= 2 && relative.steps.length >= 2);

export const ageWord = (relative: Relative) => (relative.age === "older" ? "比你大" : "比你小");

export const guessPrompt = (relative: Relative) =>
  `${stepsText(relative.steps)}${relative.age ? `（${ageWord(relative)}）` : ""}，你叫${relative.male ? "他" : "她"}什么？`;

/** 读出来时不说"TA"，免得念成两个字母。 */
export const guessSpeech = (relative: Relative) =>
  `${stepsText(relative.steps)}${relative.age ? `，${ageWord(relative)}` : ""}，你该怎么叫？`;

/** 题库里有这个人，就用题库里孩子的叫法；堂表亲没说大小，就把几种都给出来。 */
export function sureRelative(steps: readonly Step[], aged: Relative | null): Relative | null {
  const known = relativeBySteps(steps);
  return aged ?? (known && !known.age ? known : null);
}

export function trainNames(steps: readonly Step[], sex: Sex | null, aged: Relative | null): string[] {
  const sure = sureRelative(steps, aged);
  return sure ? [sure.call] : callOf(steps, sex).kid;
}

export const namesSpeech = (names: readonly string[]) => names.join("，或者");

/** 所有挂得出来、不超过 depth 节的小火车。 */
export function allTrains(depth: number): Step[][] {
  const out: Step[][] = [];
  const grow = (steps: Step[]) => {
    if (steps.length) out.push(steps);
    if (steps.length >= depth) return;
    for (const { step } of stepButtons) if (!blocked(step, steps)) grow([...steps, step]);
  };
  grow([]);
  return out;
}
