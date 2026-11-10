import type { Sex, TitleData } from '../types.ts';
import { sortData } from '../data/sort.ts';
import { pairData } from '../data/pair.ts';
import { number2zh } from '../utils/unit.ts';
import { selector2id } from './selector.ts';
import { queryCache } from './lru.ts';

// 当前模式数据，由外部设置
let currentModeData: TitleData = {};

/** 逆转ID的映射关系 - 模块级常量 */
const REVERSE_MAP: Record<string, [string, string]> = {
  f: ['d', 's'],
  m: ['d', 's'],
  h: ['w', ''],
  w: ['', 'h'],
  s: ['m', 'f'],
  d: ['m', 'f'],
  lb: ['os', 'ob'],
  ob: ['ls', 'lb'],
  xb: ['xs', 'xb'],
  ls: ['os', 'ob'],
  os: ['ls', 'lb'],
  xs: ['xs', 'xb'],
};

/** 世代数映射 - 模块级常量 */
const GEN_MAP: Record<string, number> = { f: 1, m: 1, s: -1, d: -1 };

/**
 * 逆转ID
 * 获取关系的反向表示
 */
export function reverseId(id: string, sex: Sex): string[] {
  if (!id) {
    return [''];
  }

  // 年纪判断
  let age = '';
  if (/&o$/.test(id)) {
    age = '&l';
  } else if (/&l$/.test(id)) {
    age = '&o';
  }

  id = id.replace(/&[ol\d+]/g, '');

  // 性别判断
  if (sex < 0) {
    if (/^w/.test(id)) {
      sex = 1;
    } else if (/^h/.test(id)) {
      sex = 0;
    }
  }

  const doReverse = (s: Sex): string => {
    const sid = (`,` + s + `,` + id).replace(/,[fhs]|,[olx]b/g, ',1').replace(/,[mwd]|,[olx]s/g, ',0');
    const sidArr = sid.slice(0, sid.length - 2).split(',').reverse();
    const rId = id
      .split(',')
      .reverse()
      .map((idPart, i) => {
        const mapped = REVERSE_MAP[idPart];
        return mapped ? mapped[Number(sidArr[i])] : idPart;
      })
      .join(',');
    const gen = getGenById(rId);
    return rId + (gen ? '' : age);
  };

  if (sex < 0) {
    return [doReverse(1), doReverse(0)];
  }
  return [doReverse(sex)];
}

/**
 * ID列表去重
 * 移除重复和冗余的ID
 */
export function filterId(arr: string[]): string[] {
  // 找出所有已经是简化形式的项（即简化后与原值相同的项）
  const sameList = arr.filter((item) => {
    const simplified = item.replace(/[ol](?=[s|b])/g, 'x').replace(/&[ol]/, '');
    return item === simplified;
  });

  return arr
    .filter((item) => {
      const temp = item.replace(/[ol](?=[s|b])/g, 'x').replace(/&[ol]/, '');
      return (
        sameList.includes(item) ||
        (item !== temp && !sameList.includes(temp))
      );
    })
    .filter((item, idx, arr) => arr.indexOf(item) === idx);
}

export function getGenById(id: string): number {
  let gen = 0;

  for (const sub of id.split(',')) {
    const s = sub.replace(/&[ol\d]+/, '');
    gen += GEN_MAP[s] || 0;
  }

  return gen;
}

/**
 * 通过ID获取关系称呼
 */
export function getItemsById(id: string): string[] {
  // 检查缓存
  const cached = queryCache.getId(id);
  if (cached) {
    return cached;
  }

  const items: string[] = [];

  const getData = (key: string): string[] => {
    let ids: string[] = [];
    const k1 = key.replace(/(,[sd])(,[wh])?$/, '$1&o$2');
    const k2 = key.replace(/(,[sd])(,[wh])?$/, '$1&l$2');

    if (currentModeData[k1] && currentModeData[k2]) {
      ids = [k1, k2];
    } else if (currentModeData[key]) {
      ids = [key];
    }

    return filterId(ids).map((id) => currentModeData[id]?.[0] ?? '');
  };

  // 对排序进行处理
  const sortMatch = id.match(/&(\d+)(,[hw])?$/);
  if (sortMatch) {
    const num = sortMatch[1];
    const zh = number2zh(Number.parseInt(num, 10));
    const baseId = id.replace(/&\d+/g, '');

    if (sortData[baseId]) {
      items.push(sortData[baseId][0].replace('几', zh));
    } else if (currentModeData[baseId]) {
      const gen = getGenById(baseId);
      let item = '';

      if (gen < 3 && !/[hw],/.test(baseId)) {
        for (const name of currentModeData[baseId]) {
          if (!item && name.includes('几')) {
            item = name.replace('几', zh);
            break;
          }
        }
        if (!item) {
          item = currentModeData[baseId][0];
          item = /^[大小]/.test(item) ? item.replace(/^[大小]/, zh) : zh + item;
        }
      }
      items.push(item);
    }
  }

  // 直接匹配称呼
  if (!items.length) {
    const cleanId = id.replace(/&\d+/g, '');
    items.push(...getData(cleanId));
  }

  // 忽略年龄条件查找
  if (!items.length) {
    const noAgeId = id.replace(/&[ol]/g, '');
    items.push(...getData(noAgeId));
  }

  // 忽略年龄条件查找
  if (!items.length) {
    const noAgeSpecificId = id.replace(/[ol](b|s)/g, 'x$1');
    items.push(...getData(noAgeSpecificId));
  }

  // 缩小访问查找
  if (!items.length) {
    const l = id.replace(/x/g, 'l');
    const o = id.replace(/x/g, 'o');
    items.push(...getData(o), ...getData(l));
  }

  // 存入缓存
  queryCache.setId(id, items);
  return items;
}

/**
 * 通过ID获取关系链
 */
export function getChainById(id: string, sex: Sex = -1): string | undefined {
  // 检查缓存
  const cacheKey = `${id}:${sex}`;
  const cached = queryCache.getChain(cacheKey);
  if (cached) {
    return cached;
  }

  const data: Record<string, string[]> = { ...currentModeData, xb: ['兄弟'], xs: ['姐妹'] };

  const item = id
    .split(',')
    .map((sign) => {
      const key = sign.replace(/&[ol\d]+/, '');
      return data[key]?.[0] ?? sign;
    })
    .join('的');

  let result: string | undefined;
  if (sex > -1 && data[`${sex},${id}`]) {
    if (sex === 0) {
      result = '(女性)' + item;
    } else {
      result = '(男性)' + item;
    }
  } else {
    result = item;
  }

  // 存入缓存
  if (result) {
    queryCache.setChain(cacheKey, result);
  }
  return result;
}

/**
 * 设置当前模式数据
 */
export function setModeData(data: TitleData): void {
  currentModeData = data;
}

/**
 * 获取当前模式数据
 */
export function getModeData(): TitleData {
  return currentModeData;
}

/**
 * 通过ID获取关系合称
 */
export function getPairsById(id1: string, id2: string): string[] {
  id1 = id1.replace(/&\d+/g, '');
  id2 = id2.replace(/&\d+/g, '');

  const id1X = id1.replace(/([ol])([bs])/g, 'x$2');
  const id2X = id2.replace(/([ol])([bs])/g, 'x$2');
  const id1R = id1.replace(/&[ol]/g, '');
  const id2R = id2.replace(/&[ol]/g, '');

  const result: string[] = [];
  const resultX: string[] = [];
  const resultR: string[] = [];

  for (const [key, value] of Object.entries(pairData)) {
    const selectors = key.split('#');
    if (selectors.length > 1) {
      const list1 = selector2id(selectors[0], -1);
      const list2 = selector2id(selectors[1], -1);
      const list1R = list1.map((s) => s.replace(/&[ol\d]+/, '').replace(/([ol])([bs])/g, 'x$2'));
      const list2R = list2.map((s) => s.replace(/&[ol\d]+/, '').replace(/([ol])([bs])/g, 'x$2'));

      if (
        (list1.includes(id1) && list2.includes(id2)) ||
        (list1.includes(id2) && list2.includes(id1))
      ) {
        result.push(value[0]);
      }

      if (
        (list1R.includes(id1X) && list2R.includes(id2X)) ||
        (list1R.includes(id2X) && list2R.includes(id1X))
      ) {
        resultX.push(value[0]);
      }

      if (
        (list1R.includes(id1R) && list2R.includes(id2R)) ||
        (list1R.includes(id2R) && list2R.includes(id1R))
      ) {
        resultR.push(value[0]);
      }
    }
  }

  if (!result.length) {
    return resultX.length ? resultX : resultR;
  }
  return result;
}
