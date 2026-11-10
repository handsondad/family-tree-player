import { calledMeFor, me, relatives, stepsText } from "./relatives.ts";
import { chats, dadLines, doneLines, gameLines, rightLine } from "./lines.ts";
import { tipSpeech, tips } from "./tips.ts";
import { askBackPool, callPrompt, calledMePrompt, explain, whoPrompt, wrongLine } from "../lib/quiz.ts";
import { chainSpeech, doorPrompt, greeting, matchPool, rowExplain, sideExplain, sidesPool } from "../lib/games.ts";
import { allTrains, guessPool, guessSpeech, namesSpeech, trainNames } from "../lib/train.ts";

export type Who = "nian" | "dad";
export type Line = { who: Who; text: string };

/** 车厢不超过这么多节的小火车都提前配好；更长的用浏览器自带的语音。 */
export const voicedTrainDepth = 3;

/** 游戏里所有要配音的句子，`npm run voice` 按这张单子生成。 */
export function voiceLines(): Line[] {
  const lines = new Map<string, Line>();
  const add = (who: Who, text: string) => lines.set(`${who}|${text}`, { who, text });

  for (const [nian, dad] of chats) {
    add("nian", nian);
    add("dad", dad);
  }
  for (const tip of tips) add("dad", tipSpeech(tip));
  for (const text of Object.values(dadLines)) add("dad", text);
  for (const text of doneLines) add("dad", text);
  add("nian", rightLine);

  for (const relative of relatives) {
    add("nian", relative.call);
    add("dad", relative.tip);
    if (relative.level === 0) continue;
    add("dad", callPrompt(relative));
    add("dad", whoPrompt(relative));
    add("dad", wrongLine(relative.call));
    add("dad", wrongLine(stepsText(relative.steps)));
    add("dad", doorPrompt(relative));
    add("nian", greeting(relative));
    add("dad", rowExplain(relative));
  }
  for (const relative of askBackPool) {
    const answer = calledMeFor(relative, me);
    add("dad", calledMePrompt(relative));
    add("dad", explain({ kind: "calledMe", relative, answer }));
    add("dad", wrongLine(answer));
  }
  for (const relative of sidesPool) add("dad", sideExplain(relative));
  for (const relative of matchPool) add("dad", chainSpeech(relative));
  for (const { intro, done } of Object.values(gameLines)) {
    add("dad", intro);
    for (const text of done) add("dad", text);
  }

  for (const relative of guessPool) add("dad", guessSpeech(relative));
  for (const steps of allTrains(voicedTrainDepth)) {
    const names = trainNames(steps, me, null);
    if (names.length) add("nian", namesSpeech(names));
  }
  return [...lines.values()];
}
