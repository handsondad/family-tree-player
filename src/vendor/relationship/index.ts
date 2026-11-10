/**
 * Chinese Relationship Calculator - TypeScript Version
 * 中文亲戚关系计算器 - 优化的TypeScript重构版本
 *
 * 性能优化：
 * 1. 使用Map代替Object，提供O(1)查找性能
 * 2. 实现LRU缓存机制，缓存常用查询结果
 * 3. 模块级常量提取，避免重复创建对象
 */

import type { RelationshipOptions, ParsedOptions } from './types.ts';
import { getOptions } from './utils/options.ts';
import { getSelectors, mergeSelector, selector2id } from './core/selector.ts';
import { reverseId, getItemsById, getChainById, getPairsById, setModeData as setIdModeData } from './core/id.ts';
import { getMode, modeData, setMode } from './core/mode.ts';
import { cache } from './core/cache.ts';
import { queryCache } from './core/lru.ts';

// 记录上一次使用的模式，避免重复初始化
let lastMode = 'default';

/**
 * 关系计算函数
 *
 * @param parameter - 查询参数或自然语言表达式
 * @returns 关系称谓数组
 *
 * @example
 * // 参数模式
 * relationship({ text: '爸爸的妈妈' }) // ['奶奶']
 *
 * @example
 * // 表达式模式
 * relationship('爸爸的妈妈是谁？') // ['奶奶']
 *
 * @example
 * // 计算两个对象之间的关系
 * relationship({ text: '爸爸', target: '哥哥' }) // ['伯父', '伯伯']
 */
function relationship(parameter: string | RelationshipOptions): string[] {
  // 解析自然语言表达式
  let options: ParsedOptions;
  if (typeof parameter === 'string') {
    const parsed = getOptions(parameter);
    options = {
      text: parsed.text || '',
      target: parsed.target || '',
      sex: parsed.sex ?? -1,
      type: parsed.type || 'default',
      reverse: parsed.reverse ?? false,
      mode: parsed.mode || 'default',
      optimal: parsed.optimal ?? false,
    };
  } else {
    options = {
      text: parameter.text || '',
      target: parameter.target || '',
      sex: parameter.sex ?? -1,
      type: parameter.type || 'default',
      reverse: parameter.reverse ?? false,
      mode: parameter.mode || 'default',
      optimal: parameter.optimal ?? false,
    };
  }

  // 切换模式（只在模式变化时才重新初始化）
  if (lastMode !== options.mode) {
    lastMode = options.mode;
    const currentModeData = getMode(options.mode);
    setIdModeData(currentModeData);
    cache.initialize(currentModeData);
    // 模式切换时清除查询缓存
    queryCache.clear();
  }

  // 获取选择器
  const fromSelectors = getSelectors(options.text);
  let toSelectors = getSelectors(options.target);

  if (!toSelectors.length) {
    toSelectors = [''];
  }

  const result = new Set<string>();

  for (const fromSelector of fromSelectors) {
    for (const toSelector of toSelectors) {
      const mergedResults = mergeSelector({
        from: fromSelector,
        to: toSelector,
        sex: options.sex!,
        optimal: options.optimal!,
      });

      for (const data of mergedResults) {
        if (!data) continue;

        const ids = selector2id(data.selector, data.sex);

        for (const id of ids) {
          let temps: string[];
          let sex = data.sex;

          if (options.reverse!) {
            temps = reverseId(id, sex);
            if (/([fhs1](&[ol\d]+)?|[olx]b)$/.test(id)) {
              sex = 1;
            } else {
              sex = 0;
            }
          } else {
            temps = [id];
          }

          if (options.type === 'chain') {
            for (const t of temps) {
              const chain = getChainById(t, sex);
              if (chain) result.add(chain);
            }
          } else if (options.type === 'pair') {
            const reversedTemps = reverseId(id, data.sex);
            for (const rId of reversedTemps) {
              for (const pair of getPairsById(id, rId)) {
                result.add(pair);
              }
            }
          } else {
            for (const t of temps) {
              let items = getItemsById(t);
              if (!items.length) {
                items = getItemsById(`${sex},${t}`);
              }
              for (const item of items) {
                result.add(item);
              }
            }
          }
        }
      }
    }
  }

  return Array.from(result);
}

/**
 * 获取数据表
 */
relationship.data = modeData;

/**
 * 获取数据量
 */
Object.defineProperty(relationship, 'dataCount', {
  get: () => Object.keys(modeData).length,
});

/**
 * 设置语言模式
 */
relationship.setMode = setMode;

// 默认初始化
const defaultModeData = getMode();
setIdModeData(defaultModeData);
cache.initialize(defaultModeData);

export default relationship;
