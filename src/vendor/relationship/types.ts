/**
 * 关系符号定义
 * f: 父亲, m: 母亲, h: 丈夫, w: 妻子
 * s: 儿子, d: 女儿, xb: 兄弟, xs: 姐妹
 * ob: 哥哥, lb: 弟弟, os: 姐姐, ls: 妹妹
 */
export type RelationSymbol =
  | 'f' | 'm' | 'h' | 'w'
  | 's' | 'd'
  | 'xb' | 'xs'
  | 'ob' | 'lb'
  | 'os' | 'ls';

/**
 * 年龄修饰符
 */
export type AgeModifier = 'o' | 'l' | `${number}`;

/**
 * 关系链项 - 可以是纯符号或带修饰符的符号
 */
export type ChainItem = `${RelationSymbol}` | `${RelationSymbol}&${AgeModifier}`;

/**
 * 关系链 - 逗号分隔的关系符号
 */
export type Chain = string; // "f,m,xb"

/**
 * 选择器 - 带前导逗号的关系链
 */
export type Selector = `,${Chain}`;

/**
 * 性别 - -1: 未知, 0: 女性, 1: 男性
 */
export type Sex = -1 | 0 | 1;

/**
 * 输出类型
 */
export type OutputType = 'default' | 'chain' | 'pair';

/**
 * 关系选项
 */
export interface RelationshipOptions {
  /** 目标对象的称谓汉字表达 */
  text: string;
  /** 相对对象的称谓汉字表达，空表示自己 */
  target?: string;
  /** 本人性别：0表示女性, 1表示男性, -1表示未知 */
  sex?: Sex;
  /** 转换类型 */
  type?: OutputType;
  /** 称呼方式：true对方称呼我, false我称呼对方 */
  reverse?: boolean;
  /** 模式选择 */
  mode?: string;
  /** 最短关系：计算两者之间的最短关系 */
  optimal?: boolean;
}

/**
 * 解析后的选项
 */
export interface ParsedOptions {
  text: string;
  target: string;
  sex: Sex;
  type: OutputType;
  reverse: boolean;
  mode: string;
  optimal: boolean;
}

/**
 * 选择器合并参数 / 最优计算参数
 */
export interface MergeSelectorParams {
  from: string;
  to: string;
  sex: Sex;
  optimal?: boolean;
}

/**
 * 最优计算参数 - 与 MergeSelectorParams 相同
 */
export type OptimalParams = MergeSelectorParams;

/**
 * 选择器结果
 */
export interface SelectorResult {
  selector: string;
  sex: Sex;
}

/**
 * 关系映射数据
 */
export type RelationMap = Record<string, Chain[]>;

/**
 * 前缀映射数据 - 嵌套结构
 */
export type PrefixMap = Record<string, Record<string, string[]>>;

/**
 * 称谓数据 - 键是关系链，值是对应的中文称谓数组
 */
export type TitleData = Record<string, string[]>;

/**
 * 过滤规则项
 */
export interface FilterRule {
  exp: RegExp;
  str: string;
}

/**
 * 替换规则项
 */
export interface ReplaceRule {
  exp: RegExp;
  arr: string[];
}

/**
 * 相似词映射
 */
export type SimilarMap = Record<string, string>;

