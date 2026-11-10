import type { RelationshipOptions } from '../types.ts';
import { expressionRules } from '../rules/expression.ts';

/**
 * 通过表达式获取配置
 */
export function getOptions(text: string): Partial<RelationshipOptions> {
  for (const item of expressionRules) {
    const match = text.match(item.exp);
    if (match) {
      return item.opt(match);
    }
  }
  return {};
}
