import { relatives, stepsText, type Relative } from "../data/relatives.ts";
import { ageNote, callQuestion, pronoun, shuffle, type Question, type Random } from "./quiz.ts";

export type GameId = "door" | "rows" | "sides" | "match";

/** 家里人（爸爸妈妈哥哥姐姐）太简单，小游戏里只放亲戚。 */
const kin = relatives.filter((relative) => relative.level > 0);

const take = (pool: readonly Relative[], count: number, random: Random) => shuffle(pool, random).slice(0, count);

const chainWithAge = (relative: Relative) => `${stepsText(relative.steps)}${ageNote(relative)}`;

// 过年拜年：亲戚一个个来敲门，先说是谁，再选怎么叫。

export const doorCount = 8;

/** 由易到难：3 位入门、3 位进阶、2 位挑战。 */
export function doorRound(random: Random = Math.random): Question[] {
  const byLevel = (level: number, count: number) => take(kin.filter((relative) => relative.level === level), count, random);
  return [...byLevel(1, 3), ...byLevel(2, 3), ...byLevel(3, 2)].map((relative) => ({
    ...callQuestion(relative, random),
    prompt: doorPrompt(relative)
  }));
}

export const doorPrompt = (relative: Relative) => `叮咚！是${chainWithAge(relative)}。快叫${pronoun(relative)}！`;

export const greeting = (relative: Relative) => `${relative.call}，过年好！`;

// 辈分排排站：把亲戚送到对的那一排。

export const genRows = [
  { gen: 3, label: "太爷爷辈", emoji: "🎋" },
  { gen: 2, label: "爷爷辈", emoji: "🌳" },
  { gen: 1, label: "爸爸辈", emoji: "🌿" },
  { gen: 0, label: "我这辈", emoji: "🌱" },
  { gen: -1, label: "小一辈", emoji: "🍀" }
] as const;

export const rowsCount = 8;

/** 每一辈至少来一位，剩下的随便挑。 */
export function rowsRound(random: Random = Math.random): Relative[] {
  const pool = shuffle(kin, random);
  const first = genRows.map(({ gen }) => pool.find((relative) => relative.gen === gen)!);
  const rest = pool.filter((relative) => !first.includes(relative)).slice(0, rowsCount - first.length);
  return shuffle([...first, ...rest], random);
}

const genPhrase: Record<number, string> = {
  3: "是太爷爷太奶奶那一辈的",
  2: "是爷爷奶奶那一辈的",
  1: "是爸爸妈妈那一辈的",
  0: "和你是一辈的",
  [-1]: "比你小一辈"
};

export const rowExplain = (relative: Relative) =>
  `${relative.call}就是${stepsText(relative.steps)}，${genPhrase[relative.gen]}。`;

// 爸爸家还是妈妈家：从爸爸连过来的就是爸爸家。

export const sidesCount = 10;

export const sidesPool = kin.filter((relative) => relative.side === "dad" || relative.side === "mom");

/** 两边各一半。 */
export function sidesRound(random: Random = Math.random): Relative[] {
  const half = sidesCount / 2;
  const of = (side: "dad" | "mom") => take(sidesPool.filter((relative) => relative.side === side), half, random);
  return shuffle([...of("dad"), ...of("mom")], random);
}

export const sideExplain = (relative: Relative) =>
  `${relative.call}是${relative.side === "dad" ? "爸爸" : "妈妈"}家的亲戚：${relative.call}就是${stepsText(relative.steps)}。`;

// 翻牌配对：一张写"是谁"，一张写"叫什么"。

export type MatchCard = { key: string; relative: Relative; face: "chain" | "call" };

export const matchPairs = 6;

export const matchPool = kin.filter((relative) => relative.level <= 2);

export function matchDeck(random: Random = Math.random): MatchCard[] {
  const chosen = take(matchPool, matchPairs, random);
  const cards = chosen.flatMap((relative): MatchCard[] => [
    { key: `${relative.id}-chain`, relative, face: "chain" },
    { key: `${relative.id}-call`, relative, face: "call" }
  ]);
  return shuffle(cards, random);
}

/** 翻开"是谁"那张牌时爸爸读出来的话。 */
export const chainSpeech = chainWithAge;

/** 一对翻一次算一步；最少要翻 matchPairs 步。 */
export function matchStars(moves: number): number {
  if (moves <= matchPairs * 1.5) return 3;
  if (moves <= matchPairs * 2.5) return 2;
  return 1;
}
