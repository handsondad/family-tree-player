import type { Chain, TitleData } from '../types.ts';
import { inputData } from '../data/input.ts';
import { sortData } from '../data/sort.ts';

/**
 * 优化的缓存系统
 * 使用Map代替Object，提供更好的性能和类型安全
 */
class OptimizedCache {
  /** 称谓到关系链的映射 - 使用Map优化查找性能 */
  private _titleToChain: Map<string, Chain[]> = new Map();

  /** 关系链到称谓的映射 */
  private _chainToTitle: Map<string, string[]> = new Map();

  /**
   * 合并数据源
   */
  private mergeData(target: TitleData, source: TitleData): void {
    for (const [key, value] of Object.entries(source)) {
      if (target[key]) {
        // 合并数组，去重
        const combined = [...new Set([...target[key], ...value])];
        target[key] = combined;
      } else {
        target[key] = value;
      }
    }
  }

  /**
   * 使用给定的模式数据初始化或更新缓存
   */
  initialize(modeData: TitleData): void {
    this._titleToChain.clear();
    this._chainToTitle.clear();

    // 合并input数据和sort数据用于反向查找（title -> chain）
    const combinedData: TitleData = { ...modeData };
    this.mergeData(combinedData, inputData);
    this.mergeData(combinedData, sortData);

    // 构建称谓到关系链的映射
    for (const [chain, titles] of Object.entries(combinedData)) {
      for (const title of titles) {
        if (!this._titleToChain.has(title)) {
          this._titleToChain.set(title, []);
        }
        this._titleToChain.get(title)!.push(chain as Chain);
        if (!this._chainToTitle.has(chain)) {
          this._chainToTitle.set(chain, []);
        }
        this._chainToTitle.get(chain)!.push(title);
      }
    }
  }

  /**
   * 获取称谓对应的关系链数组
   * 使用Map提供O(1)查找性能
   */
  getTitleToChain(title: string): Chain[] | undefined {
    return this._titleToChain.get(title);
  }

  /**
   * 获取关系链对应的称谓数组
   */
  getChainToTitle(chain: string): string[] | undefined {
    return this._chainToTitle.get(chain);
  }

  /**
   * 检查称谓是否存在
   */
  hasTitle(title: string): boolean {
    return this._titleToChain.has(title);
  }

  /**
   * 获取所有称谓
   */
  getAllTitles(): string[] {
    return Array.from(this._titleToChain.keys());
  }

  /**
   * 获取缓存的数据量
   */
  get size(): number {
    return this._titleToChain.size;
  }
}

// 导出单例实例
export const cache = new OptimizedCache();

// 导出类型别名用于向后兼容
export const cacheData = {
  get: (key: string): Chain[] | undefined => cache.getTitleToChain(key),
  has: (key: string): boolean => cache.hasTitle(key),
  entries: (): IterableIterator<[string, Chain[]]> => {
    const map = new Map<string, Chain[]>();
    for (const [key, value] of (cache as any)._titleToChain) {
      map.set(key, value);
    }
    return map[Symbol.iterator]();
  }
};

// 使其表现得像原始的cacheData对象
Object.defineProperty(cacheData, 'size', {
  get: () => cache.size
});
