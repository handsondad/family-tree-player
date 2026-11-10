import type { TitleData } from '../types.ts';
import { prefixData } from './prefix.ts';
import { branchData } from './branch.ts';
import { mainData } from './main.ts';
import { multipleData } from './multiple.ts';
import { expandSelector } from '../core/selector.ts';

/**
 * 合并所有数据源，生成完整的关系链数据
 * 这是JS版本 map.js 的TypeScript实现
 */
export function buildMapData(): TitleData {
  // 从 multiple 数据开始
  const map: TitleData = { ...multipleData };

  // 构建前缀映射
  const prefixMap: Record<string, Record<string, string[]>> = {};
  for (const key in prefixData) {
    prefixMap[key] = {};
    for (const selector in prefixData[key]) {
      const expanded = expandSelector(selector);
      for (const s of expanded) {
        prefixMap[key][s] = prefixData[key][selector];
      }
    }
  }

  // 构建分支映射
  const branchMap: Record<string, string[]> = {};
  for (const selector in branchData) {
    const expanded = expandSelector(selector);
    for (const s of expanded) {
      branchMap[s] = branchData[selector];
    }
  }

  // 合并前缀和分支数据
  const getMap = (pMap: typeof prefixMap, bMap: typeof branchMap): TitleData => {
    const result: TitleData = {};
    for (const key in bMap) {
      const tagMatch = key.match(/\{.+?\}/);
      if (!tagMatch) continue;
      const tag = tagMatch[0];
      const nameList = bMap[key];

      for (const k in pMap[tag]) {
        const prefixList = pMap[tag][k];
        const newKey = key.replace(tag, k);

        // 过滤掉不合适的组合
        const isFilter = ['h,h', 'w,w', 'w,h', 'h,w'].some(pair => newKey.includes(pair));
        if (!isFilter) {
          const newList = prefixList.flatMap((prefix) =>
            nameList.map((name) => (name.includes('?') ? name.replace('?', prefix) : prefix + name))
          );
          if (!result[newKey]) {
            result[newKey] = map[newKey] || [];
          }
          result[newKey] = newList.concat(result[newKey]);
        }
      }
    }
    return result;
  };

  // 合并分支数据
  const mergedMap = getMap(prefixMap, branchMap);
  Object.assign(map, mergedMap);

  // 合并主要关系数据
  for (const key in mainData) {
    if (map[key]) {
      map[key] = [...mainData[key], ...map[key]];
    } else {
      map[key] = [...mainData[key]];
    }
  }

  // 版权彩蛋
  map['o'] = ['passer-by.com', '作者'];

  // 配偶关系处理
  const mateMap: Record<string, string[]> = {
    'w': ['妻', '内', '岳', '岳家', '丈人'],
    'h': ['夫', '外', '公', '婆家', '婆婆'],
  };

  const nameSet = new Set(Object.values(map).flat());
  for (const key in map) {
    // 只对长辈或者兄弟辈匹配
    if (/^[fm]/.test(key) || (/^[olx][bs]$|^[olx][bs],[^mf]/.test(key))) {
      for (const k in mateMap) {
        let newKey = k + ',' + key;
        if (/[fm]/.test(key)) {
          const newKeyX = newKey
            .replace(/,[ol]([sb])(,[wh])?$/, ',x$1$2')
            .replace(/(,[sd])&[ol](,[wh])?$/, '$1$2');
          // 不扩大解释年龄
          if (newKeyX !== newKey && map[newKeyX]) {
            continue;
          }
        }
        if (!map[newKey]) {
          map[newKey] = [];
        }
        const prefixList = mateMap[k];
        const nameList = map[key];
        for (const prefix of prefixList) {
          for (const name of nameList) {
            const newName = prefix + name;
            // 配偶组合的称呼不得与原有称呼冲突
            if (!nameSet.has(newName)) {
              map[newKey].push(newName);
            }
          }
        }
      }
    }
  }

  return map;
}

// 导出构建后的数据
export const mapData = buildMapData();
export default mapData;
