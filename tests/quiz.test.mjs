import test from "node:test";
import assert from "node:assert/strict";
import relationship from "../src/vendor/relationship/index.ts";
import { levels, relatives, stepsText } from "../src/data/relatives.ts";
import { calledBy, kidName } from "../src/lib/kinship.ts";
import { askBackPool, calledMeOptions, lookalikes, makeRound, starsFor } from "../src/lib/quiz.ts";

const exactNames = (text) => new Set(relationship({ text, sex: 1 }).flatMap((name) => [name, kidName(name)]));
const titleNames = (title) => new Set([title, ...relationship({ text: title, sex: 1 })]);
const disjoint = (a, b) => ![...a].some((name) => b.has(name));

function seeded(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

const quizzed = relatives.filter((relative) => relative.level > 0);

test("干扰项不会碰巧也是对的", () => {
  for (const relative of quizzed) {
    const mine = exactNames(stepsText(relative.steps));
    for (const other of lookalikes(relative)) {
      assert.ok(disjoint(titleNames(other.call), mine), `${relative.call} 的题里，${other.call} 也能算对`);
      assert.ok(disjoint(titleNames(relative.call), exactNames(stepsText(other.steps))), `“谁是${relative.call}”的题里，${stepsText(other.steps)} 也能算对`);
    }
  }
});

test("每道题都凑得齐 4 个选项", () => {
  for (const relative of quizzed) assert.ok(lookalikes(relative).length >= 3, `${relative.call} 只有 ${lookalikes(relative).length} 个干扰项`);
  for (const relative of askBackPool) {
    for (const sex of [0, 1]) {
      const options = calledMeOptions(relative, sex);
      assert.ok(options.length >= 3);
      const right = new Set(calledBy(relative.steps, sex).kid);
      for (const name of options) assert.ok(!right.has(name), `${relative.call} 叫你的题里，${name} 也能算对`);
    }
  }
});

test("每一关出的题", () => {
  for (const { level, count } of levels) {
    for (const sex of [0, 1]) {
      for (let seed = 1; seed <= 40; seed++) {
        const round = makeRound(level, sex, seeded(seed));
        assert.equal(round.length, count);
        assert.equal(new Set(round.map((question) => question.relative.id)).size, count, "一轮里同一个人只考一次");
        for (const question of round) {
          assert.equal(question.options.length, 4, question.prompt);
          assert.equal(new Set(question.options).size, 4, question.prompt);
          assert.ok(question.options.includes(question.answer));
        }
      }
    }
  }
});

test("星星", () => {
  assert.equal(starsFor(8, 8), 3);
  assert.equal(starsFor(7, 8), 3);
  assert.equal(starsFor(4, 8), 2);
  assert.equal(starsFor(1, 6), 1);
});
