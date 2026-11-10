import type { TitleData } from '../types.ts';
import { mapData } from '../data/map.ts';

/**
 * 基础模式数据 - 使用合并后的完整数据
 */
const BASE_MAP: TitleData = { ...mapData };

/**
 * 模式缓存
 */
const modeCache: Record<string, TitleData> = {};

/**
 * 当前模式数据
 */
let currentModeData: TitleData = { ...BASE_MAP };

/**
 * 设置模式数据
 */
export function setMode(sign: string, data: TitleData): void {
  modeCache[sign] = { ...data };
}

/**
 * 获取模式数据
 */
export function getMode(sign?: string): TitleData {
  if (sign && modeCache[sign]) {
    currentModeData = { ...modeCache[sign] };
    // 合并基础数据（模式数据优先）
    for (const [key, value] of Object.entries(BASE_MAP)) {
      if (!currentModeData[key]) {
        currentModeData[key] = value;
      } else {
        // 模式数据放在前面，基础数据放在后面
        currentModeData[key] = [...currentModeData[key], ...value];
      }
    }
  } else {
    currentModeData = { ...BASE_MAP };
  }
  return currentModeData;
}

/**
 * 获取当前模式数据
 */
export { currentModeData as modeData };
