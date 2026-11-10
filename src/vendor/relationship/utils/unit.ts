const TEXT_ATTR = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

/**
 * 中文数字转阿拉伯数字
 */
export function zh2number(text: string): number {
  const map: Record<string, number> = { '大': 1, '小': 99 };
  if (map[text] !== undefined) {
    return map[text];
  }

  const normalized = text.replace(/^十/, '一十');
  const parts = normalized.split('十').reverse();
  const unit = TEXT_ATTR.indexOf(parts[0] ?? '');
  const dec = parts[1] !== undefined ? TEXT_ATTR.indexOf(parts[1]) : 0;

  return dec * 10 + unit;
}

/**
 * 阿拉伯数字转中文数字
 */
export function number2zh(num: number): string {
  const map: Record<number, string> = { 1: '大', 99: '小' };
  if (map[num] !== undefined) {
    return map[num];
  }

  const dec = Math.floor(num / 10);
  const unit = num % 10;
  let text = '';
  if (dec > 0) {
    text = (TEXT_ATTR[dec] + '十').replace('一十', '十');
  }
  text += TEXT_ATTR[unit];

  return text;
}
