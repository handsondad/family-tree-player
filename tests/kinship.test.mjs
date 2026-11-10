import test from "node:test";
import assert from "node:assert/strict";
import relationship from "../src/vendor/relationship/index.ts";
import { calledMeFor, relatives, stepsText } from "../src/data/relatives.ts";
import { callOf, calledBy, kidName } from "../src/lib/kinship.ts";

const lib = (text, sex = 1) => relationship({ text, sex });
/** "妈妈的哥哥" 在库里是"大舅"，泛化成"妈妈的兄弟"才是"舅舅"。 */
const generalize = (text) => text.replace(/哥哥|弟弟/g, "兄弟").replace(/姐姐|妹妹/g, "姐妹");
const chainNames = (text) => new Set([...lib(text), ...lib(generalize(text))].flatMap((name) => [name, kidName(name)]));
const titleNames = (title) => new Set([title, ...lib(title)]);
const overlaps = (a, b) => [...a].some((name) => b.has(name));

for (const relative of relatives) {
  const chain = stepsText(relative.steps);

  test(`${relative.call}（${chain}）的叫法和库对得上`, () => {
    const fromChain = chainNames(chain);
    assert.ok(fromChain.size > 0, `库算不出 ${chain}`);
    for (const name of [relative.call, ...(relative.also ?? [])]) {
      assert.ok(overlaps(titleNames(name), fromChain), `${name} 不是 ${chain}：库给的是 ${[...fromChain].join("/")}`);
    }
  });

  test(`${relative.call} 叫你的称呼和库对得上`, () => {
    for (const sex of [1, 0]) {
      const back = calledBy(relative.steps, sex).kid;
      assert.ok(back.includes(calledMeFor(relative, sex)), `${relative.call} 叫${sex ? "男孩" : "女孩"}：库给的是 ${back.join("/")}，数据写的是 ${calledMeFor(relative, sex)}`);
    }
  });
}

test("每个人的关系链都只出现一次", () => {
  const chains = relatives.map((relative) => stepsText(relative.steps));
  assert.equal(new Set(chains).size, chains.length);
  const ids = relatives.map((relative) => relative.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("同辈的亲戚要写清楚比你大还是小", () => {
  for (const relative of relatives) {
    const kid = callOf(relative.steps, 1).kid;
    if (kid.length > 1) assert.ok(relative.age, `${relative.call} 有好几种叫法 ${kid.join("/")}，要加 age`);
  }
});

test("孩子的叫法", () => {
  assert.deepEqual(callOf(["爸爸", "哥哥"], 1).kid, ["伯伯"]);
  assert.deepEqual(callOf(["妈妈", "姐姐", "女儿"], 1).kid, ["表姐", "表妹"]);
  assert.deepEqual(callOf(["爸爸", "老婆"], 0).kid, ["妈妈"]);
  assert.ok(callOf(["爸爸", "儿子"], 1).kid.includes("你自己"));
  assert.deepEqual(calledBy(["妈妈", "哥哥", "老婆"], 0).kid, ["外甥女"]);
  assert.equal(kidName("姑表哥"), "表哥");
  assert.equal(kidName("表哥"), "表哥");
  assert.deepEqual(callOf([], 1).kid, []);
});
