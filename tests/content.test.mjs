import assert from "node:assert/strict";
import { test } from "node:test";
import { dialectEntries, dialectGroups, dialectRegions, dialectTraps } from "../src/data/dialects.ts";
import { relativeById } from "../src/data/relatives.ts";
import { stories, storyById } from "../src/data/stories.ts";

test("小念问爸爸：每个故事都有一问一答，关联的亲戚在图鉴里找得到", () => {
  assert.ok(stories.length >= 6);
  const ids = new Set(stories.map((story) => story.id));
  assert.equal(ids.size, stories.length);
  for (const story of stories) {
    assert.equal(storyById(story.id), story);
    assert.ok(story.turns.length >= 3, story.id);
    for (const turn of story.turns) {
      assert.ok(turn.nian.length > 4, story.id);
      assert.ok(turn.dad.length > 10, story.id);
    }
    for (const relId of story.relatedIds) {
      assert.ok(relativeById(relId), `${story.id} 关联的 ${relId} 不存在`);
    }
  }
});

test("各地叫法大不同：每个方言区和每个分类都填齐，亲戚能跳回家族树", () => {
  const groupIds = new Set(dialectGroups.map((g) => g.id));
  for (const group of dialectGroups) {
    assert.ok(dialectEntries.some((entry) => entry.group === group.id), `分类 ${group.id} 是空的`);
  }
  for (const entry of dialectEntries) {
    assert.ok(groupIds.has(entry.group), entry.id);
    assert.ok(relativeById(entry.relativeId), `${entry.id} 关联的 ${entry.relativeId} 不存在`);
    for (const region of dialectRegions) {
      assert.ok(entry.calls[region.id]?.trim(), `${entry.id} 缺少 ${region.name} 的叫法`);
    }
  }
  assert.ok(dialectTraps.length >= 4);
});
