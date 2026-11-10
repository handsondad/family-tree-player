import type { RelationshipOptions } from '../types.ts';

/**
 * 表达式规则项
 */
interface ExpressionRule {
  exp: RegExp;
  opt: (match: RegExpMatchArray) => Partial<RelationshipOptions>;
}

/**
 * 自然语言表达式规则
 * 将语言表达转换成参数调用
 */
export const expressionRules: ExpressionRule[] = [
  {
    exp: /^(\S+?)(应该|得)?(称呼|叫|喊)(\S+?)(什么|啥)？?$/,
    opt: (m) => ({ text: m[4], target: m[1] }),
  },
  {
    exp: /^(\S+?)(应该|得)?(如何|怎么)(称呼|叫|喊)(\S+?)？?$/,
    opt: (m) => ({ text: m[5], target: m[1] }),
  },
  {
    exp: /^(\S+?)是(\S+?)的(谁|什么|什么亲戚|啥亲戚|什么人)？?$/,
    opt: (m) => ({
      text: m[1],
      target: m[2],
      type: m[1].includes('的') ? 'default' : 'chain',
    }),
  },
  {
    exp: /^(\S+?)(应该|得)?管(\S+?)叫(什么|啥)？?$/,
    opt: (m) => ({ text: m[3], target: m[1] }),
  },
  {
    exp: /^(\S+?)(和|与)(\S+?)(之间)?是(什么|啥)关系？?$/,
    opt: (m) => ({ text: m[1], target: m[3], type: 'pair' }),
  },
  {
    exp: /^(\S+?)对于(\S+?)是(什么|啥)关系？?$/,
    opt: (m) => ({ text: m[1], target: m[2], type: 'chain' }),
  },
  {
    exp: /^(\S+?)(指的)?是(什么|啥)(意思|关系|亲戚关系|辈分|人)？?$/,
    opt: (m) => ({ text: m[1], type: 'chain' }),
  },
  {
    exp: /^(\S+?)(应该|得)?(称呼|叫|喊)(什么|啥)？?$/,
    opt: (m) => ({ text: m[1] }),
  },
  {
    exp: /^(\S+?)(应该|得)?(如何|怎么)(称呼|叫|喊)？?$/,
    opt: (m) => ({ text: m[1] }),
  },
  {
    exp: /^(\S+?)是(谁|什么|什么亲戚|啥亲戚|什么人|什么辈分|啥辈分)？?$/,
    opt: (m) => ({
      text: m[1],
      type: m[1].includes('的') ? 'default' : 'chain',
    }),
  },
];

export default expressionRules;
