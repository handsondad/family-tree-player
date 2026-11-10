import type { Sex, MergeSelectorParams, OptimalParams, SelectorResult } from '../types.ts';
import { zh2number } from '../utils/unit.ts';
import { cache } from './cache.ts';
import { queryCache } from './lru.ts';
import { filterRules } from '../rules/filter.ts';
import { replaceRules } from '../rules/replace.ts';
import { similarMap } from '../rules/similar.ts';
import { reverseId, filterId, getGenById } from './id.ts';

/**
 * 获得最简关系链
 * 计算两个对象之间的最短关系路径
 */
export function getOptimal(options: OptimalParams): {
  from: string;
  to: string;
  sex: Sex;
} {
  let { from, to, sex } = options;

  let fromChain = from.split(',');
  let toChain = to.split(',');

  for (let i = 0; i < fromChain.length && i < toChain.length; i++) {
    if (fromChain[i] === toChain[i]) {
      from = fromChain.slice(i + 1).join(',');
      to = toChain.slice(i + 1).join(',');
      sex = /^(?:[fhs1](?:&[ol\d]+)?|[olx]b)(?:&[ol\d]+)?$/.test(fromChain[i]) ? 1 : 0;
      continue;
    }

    const fromGen = getGenById(fromChain[i]);
    const toGen = getGenById(toChain[i]);

    if (
      fromGen === toGen &&
      /^[xol][bs]|^[sd]/.test(fromChain[i]) &&
      /^[xol][bs]|^[sd]/.test(toChain[i])
    ) {
      const fromType = fromChain[i].replace(/&([ol\d]+)/, '').replace(/^[xol]([bs])/, '$1');
      const toType = toChain[i].replace(/&([ol\d]+)/, '').replace(/^[xol]([bs])/, '$1');

      if (fromType !== toType) {
        break;
      }

      const fromAttr = fromChain[i].match(/&([ol\d]+)/)?.[1] || fromChain[i].match(/([ol])[bs]/)?.[1] || '';
      const toAttr = toChain[i].match(/&([ol\d]+)/)?.[1] || toChain[i].match(/([ol])[bs]/)?.[1] || '';

      if (fromAttr && toAttr) {
        const fromNum = parseInt(fromAttr, 10);
        const toNum = parseInt(toAttr, 10);

        if (!isNaN(fromNum) && !isNaN(toNum)) {
          if (fromNum > toNum) {
            fromChain[i] = fromChain[i].replace(/^[xol]b|^s/, 'lb').replace(/^[xol]s|^d/, 'ls');
          } else if (fromNum < toNum) {
            fromChain[i] = fromChain[i].replace(/^[xol]b|^s/, 'ob').replace(/^[xol]s|^d/, 'os');
          }
        } else {
          const fromIsOld = fromAttr === 'o' || (!isNaN(fromNum) && toAttr === 'l');
          const toIsOld = toAttr === 'o' || (!isNaN(toNum) && fromAttr === 'l');

          if (fromIsOld && !toIsOld) {
            fromChain[i] = fromChain[i].replace(/^[xol]b|^s/, 'lb').replace(/^[xol]s|^d/, 'ls');
          } else if (toIsOld && !fromIsOld) {
            fromChain[i] = fromChain[i].replace(/^[xol]b|^s/, 'ob').replace(/^[xol]s|^d/, 'os');
          }
        }

        from = fromChain.slice(i).join(',');
        to = toChain.slice(i + 1).join(',');
        sex = /^(?:[fhs1](?:&[ol\d]+)?|[olx]b)(?:&[ol\d]+)?$/.test(toChain[i]) ? 1 : 0;
      } else if (options.optimal) {
        const fromX = fromChain[i].match(/([xol])[bs]/)?.[1] || '';
        const toX = toChain[i].match(/([xol])[bs]/)?.[1] || '';

        if (fromX === 'x' || toX === 'x') {
          from = fromChain.slice(i + 1).join(',');
          to = toChain.slice(i + 1).join(',');
          sex = /^(?:[fhs1](?:&[ol\d]+)?|[olx]b)(?:&[ol\d]+)?$/.test(fromChain[i]) ? 1 : 0;
          continue;
        }
      }
    }
    break;
  }

  return { from, to, sex };
}

// ============================================================================
// getSelectors 相关辅助函数 - 拆分以降低复杂度
// ============================================================================

/**
 * 标准化输入文本
 * 处理"之"、"吾"、"我"等词汇
 */
function normalizeInput(str: string): string {
  return str
    .replace(/之/g, '的')
    .replace(/吾之?(.+)/, '$1')
    .replace(/我的?(.+)/, '$1');
}

/**
 * 口语标准化
 * 处理"家的"等口语化表达
 */
function normalizeColloquial(str: string): string {
  // 处理"家的孩子/儿子/女儿"
  if (/[^娘婆岳亲]家的?(孩子|儿子|女儿)/.test(str)) {
    str = str.replace(/家的?/, '的');
  }

  // 处理各种家族关系口语表达
  return str
    .replace(/(舅|姑)+(爸|父|丈|妈|母)?家的?(哥|姐|弟|妹)+/, '$1表$3')
    .replace(/(舅|姑)+(爸|父|丈|妈|母)?家的?/, '$1表')
    .replace(/(伯|叔)+(父|母)?家的?(哥|姐|弟|妹)+/, '堂$3')
    .replace(/(伯|叔)+(父|母)?家的?/, '堂')
    .replace(/姨+(爸|父|丈|妈|母)?家的?(哥|姐|弟|妹)+/, '姨$2')
    .replace(/姨+(爸|父|丈|妈|母)?家的?/, '姨');
}

/**
 * 扩展关键词
 * 通过词义扩展和同义词替换生成更多关键词
 * 使用迭代实现避免递归深度问题
 */
function expandKeywords(name: string): string[] {
  const keywords = new Set<string>([name]);
  const queue: string[] = [name];
  const maxIterations = 100; // 防止无限循环
  let iterations = 0;

  while (queue.length > 0 && iterations < maxIterations) {
    iterations++;
    const currentName = queue.shift()!;

    // 词义扩展
    for (const rule of replaceRules) {
      for (const word of rule.arr) {
        const newName = currentName.replace(rule.exp, word);
        if (newName !== currentName && !keywords.has(newName)) {
          keywords.add(newName);
          queue.push(newName);
        }
      }
    }

    // 同义词替换
    for (const [source, target] of Object.entries(similarMap)) {
      const name1 = currentName.replace(source, target);
      const name2 = currentName.replace(target, source);
      if (name1 !== currentName && !keywords.has(name1)) {
        keywords.add(name1);
      }
      if (name2 !== currentName && !keywords.has(name2)) {
        keywords.add(name2);
      }
    }
  }

  return Array.from(keywords);
}

/**
 * 标准化关键词
 * 将方言中的"小"字变体统一处理
 */
function normalizeKeyword(keyword: string): string {
  return keyword.replace(/^[尕幺细满碎晚末尾幼]/, '小');
}

/**
 * 处理排行匹配
 * 根据关键词中的排行信息查找对应的关系链
 */
function processRankingMatch(
  normalizedKeyword: string,
  itemsMap: string[][]
): void {
  const match = normalizedKeyword.match(/^[大小]|^[一二三四五六七八九十]+/);
  if (!match) return;

  const xName = normalizedKeyword.replace(match[0], '几');
  const rName = normalizedKeyword.replace(match[0], '');
  const num = zh2number(match[0]);

  const namesToCheck = [xName, rName, normalizedKeyword];

  namesToCheck.forEach((n, index) => {
    const ids = cache.getTitleToChain(n);
    if (ids && ids.length) {
      for (const id of ids) {
        const newId = id
          .replace(/(,[hw])$/, `&${num}$1`)
          .replace(/([^hw]+)$/, `$1&${num}`);
        // 直系祖辈不参与排序
        if (!/^[mf,]+$/.test(id) && !/^[从世]/.test(n)) {
          itemsMap[index].push(newId);
        }
      }
    }
  });
}

/**
 * 通过关键词查找关系链
 * 返回直接匹配的关系链和排行匹配的关系链
 */
function findChainsByKeywords(keywords: string[]): {
  directItems: string[];
  rankingItems: string[][];
} {
  const directItems: string[] = [];
  const rankingItems: string[][] = [[], [], []];

  for (const keyword of keywords) {
    const normalizedKeyword = normalizeKeyword(keyword);

    // 处理排行匹配
    processRankingMatch(normalizedKeyword, rankingItems);

    // 直接匹配
    const cachedChains = cache.getTitleToChain(normalizedKeyword);
    if (cachedChains) {
      directItems.push(...cachedChains);
    }
  }

  return { directItems, rankingItems };
}

/**
 * 选择最佳匹配结果
 * 优先使用直接匹配，其次使用排行匹配
 */
function selectBestItems(
  directItems: string[],
  rankingItems: string[][]
): string[] {
  if (directItems.length > 0) {
    return directItems;
  }

  // 如找不到直接匹配结果，使用排行匹配
  for (const items of rankingItems) {
    if (items.length > 0) {
      return items;
    }
  }

  return [];
}

/**
 * 组合关系链结果
 * 将当前结果与新的关系链项组合
 */
function combineResults(prevResults: string[], newItems: string[]): string[] {
  const combined: string[] = [];
  const baseResults = prevResults.length > 0 ? prevResults : [''];

  for (const prev of baseResults) {
    for (const item of newItems) {
      combined.push(prev + (item ? `,${item}` : ''));
    }
  }

  return combined;
}

/**
 * 处理单个称谓词
 * 扩展关键词并查找对应的关系链
 */
function processSingleName(name: string): string[] {
  // 扩展关键词
  const keywords = expandKeywords(name);

  // 查找关系链
  const { directItems, rankingItems } = findChainsByKeywords(keywords);

  // 选择最佳匹配
  return selectBestItems(directItems, rankingItems);
}

/**
 * 中文获取选择器
 * 将中文称谓转换为关系链数组
 */
export function getSelectors(str: string): string[] {
  // 检查缓存
  const originalStr = str;
  const cached = queryCache.getSelector(originalStr);
  if (cached) {
    return cached;
  }

  // 标准化输入
  str = normalizeInput(str);
  str = normalizeColloquial(str);

  // 按"的"分割处理
  const nameParts = str.split('的');
  let result: string[] = [];
  let isMatch = true;

  for (const name of nameParts) {
    const items = processSingleName(name);

    // 完全匹配不到结果
    if (items.length === 0) {
      isMatch = false;
    }

    // 组合结果
    result = combineResults(result, items);
  }

  // 过滤并缓存结果
  const finalResult = isMatch ? filterId(result) : [];
  queryCache.setSelector(originalStr, finalResult);

  return finalResult;
}

/**
 * 合并选择器，查找两个对象之间的关系
 */
export function mergeSelector(param: MergeSelectorParams): SelectorResult[] {
  let { from: fromSelector, to: toSelector, sex: mySex } = param;

  // 性别推断
  if (mySex < 0) {
    const fromSex = /^,[w1]/.test(fromSelector) ? 1 : /^,[h0]/.test(fromSelector) ? 0 : -1;
    const toSex = /^,[w1]/.test(toSelector) ? 1 : /^,[h0]/.test(toSelector) ? 0 : -1;

    if (fromSex === -1 && toSex > -1) {
      mySex = toSex;
    } else if (fromSex > -1 && toSex === -1) {
      mySex = fromSex;
    } else if (fromSex === toSex) {
      mySex = fromSex;
    } else {
      return [];
    }
  }

  const fromIds = selector2id(param.from, mySex);
  const toIds = selector2id(param.to, mySex);

  if (!fromIds.length || !toIds.length) {
    return [];
  }

  const result: SelectorResult[] = [];

  for (const from of fromIds) {
    for (const to of toIds) {
      let sex = mySex;
      const selector = `,${to}`;

      if (/,(?:[fhs1](?:&[ol\d]+)?|[olx]b)(?:&[ol\d]+)?$/.test(selector)) {
        sex = 1;
      }
      if (/,(?:[mwd0](?:&[ol\d]+)?|[olx]s)(?:&[ol\d]+)?$/.test(selector)) {
        sex = 0;
      }

      let currentFrom = from;
      let currentTo = to;
      let isOptimal = param.optimal ?? false;

      if (from && to) {
        if (/&\d+/.test(from) || /\d+/.test(to)) {
          isOptimal = true;
        }

        if (isOptimal) {
          const optimal = getOptimal({
            from: currentFrom,
            to: currentTo,
            sex: mySex,
            optimal: param.optimal,
          });
          currentFrom = optimal.from;
          currentTo = optimal.to;
          sex = optimal.sex;
        }
      }

      const toRids = currentTo ? reverseId(currentTo, mySex) : [''];

      for (const toR of toRids) {
        const newSelector = (toR ? `,${toR}` : '') + (currentFrom ? `,${currentFrom}` : '');
        result.push({ selector: newSelector, sex });
      }
    }
  }

  return result;
}

/**
 * 扩展选择器
 * 应用过滤规则并展开选择器
 */
export function expandSelector(selector: string): string[] {
  const result: string[] = [];
  const hash = new Set<string>();

  const apply = (sel: string): void => {
    if (hash.has(sel)) return;

    hash.add(sel);
    let s = '';

    do {
      s = sel;
      for (const item of filterRules) {
        sel = sel.replace(item.exp, item.str);
        if (sel.includes('#')) {
          sel.split('#').forEach(apply);
          return;
        }
      }
    } while (s !== sel);

    // 同志关系去除
    if (/,[mwd0](?:&[ol\d+])?,w|,[hfs1](?:&[ol\d]+)?,h/.test(sel)) {
      return;
    }

    result.push(sel);
  };

  apply(selector);
  return result;
}

/**
 * 选择器转ID
 */
export function selector2id(selector: string, sex: Sex): string[] {
  if (!selector.startsWith(',')) {
    selector = `,${selector}`;
  }

  // 性别判断
  if (sex < 0) {
    if (/^,[w1]/.test(selector)) {
      sex = 1;
    } else if (/^,[h0]/.test(selector)) {
      sex = 0;
    }
  } else if (sex === 1 && /^,[h0]/.test(selector)) {
    return [];
  } else if (sex === 0 && /^,[w1]/.test(selector)) {
    return [];
  }

  if (sex > -1 && !selector.includes(',1') && !selector.includes(',0')) {
    selector = `,${sex}${selector}`;
  }

  // 同志关系去除
  if (/,[mwd0](?:&[ol\d]+)?,w|,[hfs1](?:&[ol\d]+)?,h/.test(selector)) {
    return [];
  }

  const expanded = expandSelector(selector);
  const result = expanded.map((s) => s.replace(/,[01]/, '').substring(1));

  return filterId(result);
}
