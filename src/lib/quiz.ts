import { calledMeFor, relatives, stepsText, type QuizLevel, type Relative, type Sex } from "../data/relatives.ts";

export type QuestionKind = "call" | "who" | "calledMe";

export type Question = {
  key: string;
  kind: QuestionKind;
  relative: Relative;
  prompt: string;
  options: string[];
  answer: string;
};

export type Random = () => number;

export function shuffle<T>(list: readonly T[], random: Random): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const namesOf = (relative: Relative) => [relative.call, ...(relative.also ?? [])];

/** 两个人的叫法有重叠，或者在某些地方叫法一样，就不能互相当干扰项。 */
export function clash(a: Relative, b: Relative): boolean {
  if (a.id === b.id) return true;
  if (a.notWith?.includes(b.id) || b.notWith?.includes(a.id)) return true;
  // 表姐和表妹只差在年龄，光看关系链分不出来
  if (a.age && b.age && a.call[0] === b.call[0]) return true;
  const names = new Set(namesOf(a));
  return namesOf(b).some((name) => names.has(name));
}

/** 和 TA 同性别、辈分最接近的人，最容易叫混，排在前面。 */
export function lookalikes(relative: Relative): Relative[] {
  return relatives
    .filter((other) => other.male === relative.male && !clash(relative, other))
    .map((other) => ({ other, distance: Math.abs(other.gen - relative.gen) }))
    .filter(({ distance }) => distance <= 1)
    .sort((a, b) => a.distance - b.distance)
    .map(({ other }) => other);
}

function pickLookalikes(relative: Relative, random: Random, count = 3): Relative[] {
  const near = lookalikes(relative);
  const same = shuffle(near.filter((other) => other.gen === relative.gen), random);
  const next = shuffle(near.filter((other) => other.gen !== relative.gen), random);
  return [...same, ...next].slice(0, count);
}

export const ageNote = (relative: Relative) =>
  relative.age === "older" ? "，比你大" : relative.age === "younger" ? "，比你小" : "";

export const pronoun = (relative: Relative) => (relative.male ? "他" : "她");

export const callPrompt = (relative: Relative) => `${stepsText(relative.steps)}${ageNote(relative)}，你叫${pronoun(relative)}什么？`;
export const whoPrompt = (relative: Relative) => `谁是你的${relative.call}？`;
export const calledMePrompt = (relative: Relative) => `${relative.call}叫你什么？`;

/** 爸爸在答完题后的讲解；"TA 叫你什么"的题先把两头的叫法对上。 */
export function explain({ kind, relative, answer }: Pick<Question, "kind" | "relative" | "answer">): string {
  if (kind !== "calledMe") return relative.tip;
  const ta = pronoun(relative);
  return `你叫${ta}${relative.call}，${ta}就叫你${answer}。${relative.tip}`;
}

export const wrongLine = (answer: string) => `答案是${answer}。`;

export function callQuestion(relative: Relative, random: Random): Question {
  const others = pickLookalikes(relative, random).map((other) => other.call);
  return {
    key: `call-${relative.id}`, kind: "call", relative,
    prompt: callPrompt(relative),
    options: shuffle([relative.call, ...others], random),
    answer: relative.call
  };
}

export function whoQuestion(relative: Relative, random: Random): Question {
  const answer = stepsText(relative.steps);
  const others = pickLookalikes(relative, random).map((other) => stepsText(other.steps));
  return {
    key: `who-${relative.id}`, kind: "who", relative,
    prompt: whoPrompt(relative),
    options: shuffle([answer, ...others], random),
    answer
  };
}

export const askBackPool = relatives.filter((relative) => relative.level > 0 && relative.askBack !== false);

/** 别人叫我的称呼，按辈分找最像的几个当干扰项。 */
export function calledMeOptions(relative: Relative, sex: Sex): string[] {
  const answer = calledMeFor(relative, sex);
  const seen = new Set([answer]);
  return askBackPool
    .map((other) => ({ name: calledMeFor(other, sex), distance: Math.abs(other.gen - relative.gen) }))
    .sort((a, b) => a.distance - b.distance)
    .map(({ name }) => name)
    .filter((name) => !(relative.age && name[0] === answer[0]))
    .filter((name) => !seen.has(name) && seen.add(name));
}

export function calledMeQuestion(relative: Relative, sex: Sex, random: Random): Question {
  const answer = calledMeFor(relative, sex);
  const near = calledMeOptions(relative, sex);
  const others = [...shuffle(near.slice(0, 5), random), ...near.slice(5)].slice(0, 3);
  return {
    key: `back-${relative.id}`, kind: "calledMe", relative,
    prompt: calledMePrompt(relative),
    options: shuffle([answer, ...others], random),
    answer
  };
}

type Plan = { call: number; who: number; back: number; backLevels: readonly number[] };

export const plans: Record<QuizLevel, Plan> = {
  1: { call: 4, who: 2, back: 0, backLevels: [] },
  2: { call: 5, who: 2, back: 1, backLevels: [1] },
  3: { call: 3, who: 1, back: 4, backLevels: [1, 2, 3] }
};

export function makeRound(level: QuizLevel, sex: Sex, random: Random = Math.random): Question[] {
  const plan = plans[level];
  const pool = shuffle(relatives.filter((relative) => relative.level === level), random);
  const asked = pool.slice(0, plan.call + plan.who);
  const used = new Set(asked.map((relative) => relative.id));
  const backPool = shuffle(askBackPool.filter((relative) => plan.backLevels.includes(relative.level) && !used.has(relative.id)), random);
  const questions = [
    ...asked.slice(0, plan.call).map((relative) => callQuestion(relative, random)),
    ...asked.slice(plan.call).map((relative) => whoQuestion(relative, random)),
    ...backPool.slice(0, plan.back).map((relative) => calledMeQuestion(relative, sex, random))
  ];
  return shuffle(questions, random);
}

export function starsFor(score: number, total: number): number {
  if (!total) return 0;
  const ratio = score / total;
  if (ratio >= 0.85) return 3;
  if (ratio >= 0.5) return 2;
  return 1;
}
