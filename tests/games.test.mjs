import assert from "node:assert/strict";
import { test } from "node:test";
import { stepsText } from "../src/data/relatives.ts";
import {
  doorCount, doorRound, genRows, matchDeck, matchPairs, matchPool, matchStars, rowExplain, rowsCount, rowsRound,
  sidesCount, sidesPool, sidesRound
} from "../src/lib/games.ts";

function seeded(seed) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

const seeds = Array.from({ length: 40 }, (_, i) => i + 1);
const unique = (list) => new Set(list).size === list.length;

test("过年拜年：8 位不同的客人，由易到难，选项里有答案", () => {
  for (const seed of seeds) {
    const round = doorRound(seeded(seed));
    assert.equal(round.length, doorCount);
    assert.ok(unique(round.map((q) => q.relative.id)));
    const levels = round.map((q) => q.relative.level);
    assert.deepEqual(levels, [...levels].sort((a, b) => a - b));
    for (const q of round) {
      assert.ok(q.options.includes(q.answer));
      assert.ok(unique(q.options), q.options.join("/"));
      assert.ok(q.options.length >= 3);
    }
  }
});

test("辈分排排站：每一辈都有人，不重复", () => {
  for (const seed of seeds) {
    const round = rowsRound(seeded(seed));
    assert.equal(round.length, rowsCount);
    assert.ok(unique(round.map((r) => r.id)));
    for (const { gen } of genRows) assert.ok(round.some((r) => r.gen === gen), `缺第 ${gen} 辈`);
  }
});

test("辈分排排站：每位亲戚都有一排可站，讲解说得出是哪一辈", () => {
  const gens = new Set(genRows.map(({ gen }) => gen));
  for (const relative of [...sidesPool, ...matchPool]) {
    assert.ok(gens.has(relative.gen), relative.call);
    assert.doesNotMatch(rowExplain(relative), /undefined/);
  }
});

test("爸爸家还是妈妈家：从爸爸连过来的才算爸爸家", () => {
  for (const relative of sidesPool) {
    assert.equal(relative.steps[0] === "爸爸", relative.side === "dad", `${relative.call}：${stepsText(relative.steps)}`);
  }
});

test("爸爸家还是妈妈家：两边各一半，不重复", () => {
  for (const seed of seeds) {
    const round = sidesRound(seeded(seed));
    assert.equal(round.length, sidesCount);
    assert.ok(unique(round.map((r) => r.id)));
    assert.equal(round.filter((r) => r.side === "dad").length, sidesCount / 2);
  }
});

test("翻牌配对：每位亲戚两张牌，叫法和关系链都不撞", () => {
  for (const seed of seeds) {
    const deck = matchDeck(seeded(seed));
    assert.equal(deck.length, matchPairs * 2);
    assert.ok(unique(deck.map((card) => card.key)));
    const people = [...new Map(deck.map((card) => [card.relative.id, card.relative])).values()];
    assert.equal(people.length, matchPairs);
    assert.ok(unique(people.map((r) => r.call)));
    assert.ok(unique(people.map((r) => `${stepsText(r.steps)}|${r.age ?? ""}`)));
  }
});

test("翻牌配对：翻得越少星星越多", () => {
  assert.equal(matchStars(matchPairs), 3);
  assert.equal(matchStars(matchPairs * 2), 2);
  assert.equal(matchStars(matchPairs * 4), 1);
});
