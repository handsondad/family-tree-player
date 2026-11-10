/**
 * LRU (Least Recently Used) Cache implementation
 * 使用 Map 的有序特性实现 O(1) 的 get 和 set 操作
 * Map 会按照插入顺序迭代，删除并重新插入即可更新访问顺序
 */
export class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // 更新访问顺序：删除并重新插入 - O(1)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    // 如果键已存在，删除旧的（更新访问顺序）
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // 如果容量已满，移除最少使用的项（Map的第一个元素）
      const lruKey = this.cache.keys().next().value;
      if (lruKey !== undefined) {
        this.cache.delete(lruKey);
      }
    }
    // 添加新项（插入到末尾）
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

/**
 * 查询缓存 - 缓存最近查询的结果
 */
export class QueryCache {
  private selectorCache: LRUCache<string, string[]>;
  private idCache: LRUCache<string, string[]>;
  private chainCache: LRUCache<string, string>;

  constructor(
    selectorCapacity = 500,
    idCapacity = 500,
    chainCapacity = 200
  ) {
    this.selectorCache = new LRUCache(selectorCapacity);
    this.idCache = new LRUCache(idCapacity);
    this.chainCache = new LRUCache(chainCapacity);
  }

  // 缓存中文到选择器的转换结果
  getSelector(key: string): string[] | undefined {
    return this.selectorCache.get(key);
  }

  setSelector(key: string, value: string[]): void {
    this.selectorCache.set(key, value);
  }

  // 缓存ID到中文的转换结果
  getId(key: string): string[] | undefined {
    return this.idCache.get(key);
  }

  setId(key: string, value: string[]): void {
    this.idCache.set(key, value);
  }

  // 缓存关系链
  getChain(key: string): string | undefined {
    return this.chainCache.get(key);
  }

  setChain(key: string, value: string): void {
    this.chainCache.set(key, value);
  }

  clear(): void {
    this.selectorCache.clear();
    this.idCache.clear();
    this.chainCache.clear();
  }
}

// 导出单例实例
export const queryCache = new QueryCache();
