import type { FilterRule } from '../types.ts';

/**
 * 关系链缩写规则
 * 将关系链缩减成最简表达
 *
 * 关系数据语法说明：
 * 关系符: f:父; m:母; h:夫; w:妻; s:子; d:女; xb:兄弟; ob:兄; lb:弟; xs:姐妹; os:姐; ls:妹
 * 修饰符: 1:男性; 0:女性; &o:年长; &l:年幼; &\d+:排序; #:隔断; [a|b]:并列
 */
export const filterRules: FilterRule[] = [
  /* 年龄 */
  {
    exp: /^(.+)&o([^#]+)&l/g,
    str: '$1$2',
  },
  {
    exp: /^(.+)&l([^#]+)&o/g,
    str: '$1$2',
  },
  {
    exp: /^(.+)?,o([sb](&\d+)?)([^#]+)&l/g,
    str: '$1,x$2$4',
  },
  {
    exp: /^(.+)?,l([sb](&\d+)?)([^#]+)&o/g,
    str: '$1,x$2$4',
  },
  /* 兄弟姐妹 */
  {
    exp: /(,o[sb](&\d+)?)+(,o[sb])(&\d+)?/,
    str: '$3$4',
  },
  {
    exp: /(,l[sb](&\d+)?)+(,l[sb])(&\d+)?/,
    str: '$3$4',
  },
  {
    exp: /^(.*,[fh1])(,[olx][sb](&\d+)?)+,[olx]b(.*)$/,
    str: '$1,xb$4#$1$4',
  },
  {
    exp: /^(.*,[mw0])(,[olx][sb](&\d+)?)+,[olx]s(.*)$/,
    str: '$1,xs$4#$1$4',
  },
  {
    exp: /(,[fh1])(,[olx][sb](&\d+)?)+,[olx]s/g,
    str: '$1,xs',
  },
  {
    exp: /(,[mw0])(,[olx][sb](&\d+)?)+,[olx]b/g,
    str: '$1,xb',
  },
  {
    exp: /^,[olx][sb](&\d+)?,[olx]b(.+)?$/,
    str: ',xb$2#$2',
  },
  {
    exp: /^,[olx][sb](&\d+)?,[olx]s(.+)?$/,
    str: ',xs$2#$2',
  },
  {
    exp: /^,x([sb])$/,
    str: ',o$1#,l$1',
  },
  /* 父母 */
  {
    exp: /m,h/g,
    str: 'f',
  },
  {
    exp: /f,w/g,
    str: 'm',
  },
  {
    exp: /,[xol][sb](&\d+)?(,[mf])/g,
    str: '$2',
  },
  /* 父母的子女 */
  {
    exp: /,[mf],d(&\d+)/,
    str: ',xs$1',
  },
  {
    exp: /,[mf],d&([ol])/,
    str: ',$1s',
  },
  {
    exp: /,[mf],s(&\d+)/,
    str: ',xb$1',
  },
  {
    exp: /,[mf],s&([ol])/,
    str: ',$1b',
  },
  {
    exp: /^(.*,[fh1]|[xol]b(&\d+)?),[mf],s(.*)$/,
    str: '$1,xb$3#$1$3',
  },
  {
    exp: /^(.*,[mw0]|[xol]s(&\d+)?),[mf],d(.*)$/,
    str: '$1,xs$3#$1$3',
  },
  {
    exp: /(,[mw0]|[xol]s(&\d+)?),[mf],s/,
    str: '$1,xb',
  },
  {
    exp: /(,[fh1]|[xol]b(&\d+)?),[mf],d/,
    str: '$1,xs',
  },
  {
    exp: /^,[mf],s(.+)?$/,
    str: ',xb$1#,1$1',
  },
  {
    exp: /^,[mf],d(.+)?$/,
    str: ',xs$1#,0$1',
  },
  /* 孩子 */
  {
    exp: /,[ds](&[ol\d]+)?,[olx]b(&\d+)/g,
    str: ',s$2',
  },
  {
    exp: /,[ds](&[ol\d]+)?,[olx]s(&\d+)/g,
    str: ',d$2',
  },
  {
    exp: /,[ds]&o,ob/g,
    str: ',s&o',
  },
  {
    exp: /,[ds]&o,os/g,
    str: ',d&o',
  },
  {
    exp: /,[ds]&l,lb/g,
    str: ',s&l',
  },
  {
    exp: /,[ds]&l,ls/g,
    str: ',d&l',
  },
  {
    exp: /,[ds](&[ol\d]+)?,[olx]s(&\d+)?/g,
    str: ',d$2',
  },
  {
    exp: /,[ds](&[ol\d]+)?,[olx]b(&\d+)?/g,
    str: ',s$2',
  },
  /* 夫妻 */
  {
    exp: /(,[mwd0]|,[olx]s)(&[ol\d]+)?,[ds](&[ol\d]+)?,m/g,
    str: '$1',
  },
  {
    exp: /(,[mwd0]|,[olx]s)(&[ol\d]+)?,[ds](&[ol\d]+)?,f/g,
    str: '$1,h',
  },
  {
    exp: /(,[fhs1]|,[olx]b)(&[ol\d]+)?,[ds](&[ol\d]+)?,f/g,
    str: '$1',
  },
  {
    exp: /(,[fhs1]|,[olx]b)(&[ol\d]+)?,[ds](&[ol\d]+)?,m/g,
    str: '$1,w',
  },
  {
    exp: /^,[ds],m(.+)?$/,
    str: ',w$1#$1',
  },
  {
    exp: /^,[ds],f(.+)?$/,
    str: ',h$1#$1',
  },
  {
    exp: /,[wh](,[ds])/g,
    str: '$1',
  },
  {
    exp: /,w,h|,h,w/g,
    str: '',
  },
  {
    exp: /(.+)?\[([^\|]+?)\|([^\[\]]*\|[^\[\]]*)\](.+)?/g,
    str: '$1$2$4#$1[$3]$4',
  },
  {
    exp: /(.+)?\[([^\[\]\|]+?)\|([^\[\]\|]+?)?\](.+)?/g,
    str: '$1$2$4#$1$3$4',
  },
];

export default filterRules;
