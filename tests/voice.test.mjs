import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { voiceLines } from "../src/data/voice-lines.ts";
import { clipHash, voices } from "../tools/voice/voices.mjs";

const manifest = JSON.parse(readFileSync(new URL("../src/data/voice-manifest.json", import.meta.url), "utf8"));

test("小念和爸爸用的是 bodyverse 里同样的声音", () => {
  assert.deepEqual(voices.nian, { voice: "zh-CN-YunxiaNeural", rate: "+0%" });
  assert.deepEqual(voices.dad, { voice: "zh-CN-YunxiNeural", rate: "-5%" });
  assert.deepEqual(manifest.voices, voices);
});

test("念出来的句子里没有 TA，免得读成两个字母", () => {
  assert.deepEqual(voiceLines().filter(({ text }) => /[A-Za-z]/.test(text)), []);
});

test("每一句台词都配好了音，而且是最新的", () => {
  const missing = voiceLines().filter(({ who, text }) => {
    const clip = manifest.clips[`${who}|${text}`];
    return !clip || clip.file !== `${who}/${clipHash(who, text)}` || !existsSync(new URL(`../public/voice/${clip.file}.mp3`, import.meta.url));
  });
  assert.deepEqual(missing.map(({ who, text }) => `${who}|${text}`), [], "运行 npm run voice 补上");
});
