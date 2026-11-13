/**
 * 各地叫法大不同：中国八大方言区的亲属称谓对照，以及跨省走亲戚容易闹笑话的趣味卡片。
 * 改了爸爸语音字段要重新跑 `npm run voice`。
 */

export type DialectGroupId = "grand" | "dadSide" | "momSide" | "peer";

export type DialectRegion = {
  id: string;
  name: string;
  area: string;
  emoji: string;
  color: string;
};

export const dialectRegions: readonly DialectRegion[] = [
  { id: "mandarin", name: "普通话", area: "全国通用", emoji: "🏮", color: "#ff9f43" },
  { id: "north", name: "北方话", area: "京津·东北·华北", emoji: "🥟", color: "#4d96ff" },
  { id: "cantonese", name: "粤语", area: "广东·香港·广西", emoji: "🫖", color: "#ff6b6b" },
  { id: "minnan", name: "闽南话", area: "闽南·潮汕·台湾", emoji: "🍵", color: "#6bcb77" },
  { id: "wu", name: "吴语", area: "上海·苏锡常·浙北", emoji: "🌸", color: "#ff6bd6" },
  { id: "sichuan", name: "川渝话", area: "四川·重庆", emoji: "🐼", color: "#e67e22" },
  { id: "xiang", name: "湘语", area: "湖南各地", emoji: "🌶️", color: "#e74c3c" },
  { id: "hakka", name: "客家话", area: "赣南·闽西·粤东", emoji: "🏯", color: "#a66cff" }
];

export type DialectEntry = {
  id: string;
  /** 对应 relatives.ts 里的亲戚 id，方便一键跳去家族树 */
  relativeId: string;
  group: DialectGroupId;
  emoji: string;
  chain: string;
  calls: Record<string, string>;
  /** 爸爸用语音讲一句各地叫法的亮点 */
  dadNote: string;
};

export const dialectGroups: readonly { id: DialectGroupId; title: string; emoji: string }[] = [
  { id: "grand", title: "祖辈长辈", emoji: "👴" },
  { id: "dadSide", title: "爸爸这边", emoji: "👨" },
  { id: "momSide", title: "妈妈这边", emoji: "👩" },
  { id: "peer", title: "兄弟姐妹", emoji: "👦" }
];

export const dialectEntries: readonly DialectEntry[] = [
  {
    id: "yeye", relativeId: "yeye", group: "grand", emoji: "👴", chain: "爸爸的爸爸",
    calls: {
      mandarin: "爷爷", north: "爷爷", cantonese: "阿爷 / 爷爷", minnan: "阿公 / 内公",
      wu: "爹爹 / 阿爷", sichuan: "爷爷 / 公公", xiang: "爹爹", hakka: "阿公"
    },
    dadNote: "爸爸的爸爸，全国大多叫爷爷，但在上海、苏州和湖南很多地方叫爹爹，闽南和客家叫阿公。"
  },
  {
    id: "nainai", relativeId: "nainai", group: "grand", emoji: "👵", chain: "爸爸的妈妈",
    calls: {
      mandarin: "奶奶", north: "奶奶", cantonese: "阿嫲 / 嫲嫲", minnan: "阿嬷 / 内嬷",
      wu: "唔奶 / 阿娘", sichuan: "奶奶 / 婆婆", xiang: "娭毑", hakka: "阿婆 / 阿嫲"
    },
    dadNote: "爸爸的妈妈，北方叫奶奶，广东粤语叫阿嫲，闽南叫阿嬷，湖南长沙一带亲切地叫娭毑。"
  },
  {
    id: "waigong", relativeId: "waigong", group: "grand", emoji: "👴", chain: "妈妈的爸爸",
    calls: {
      mandarin: "外公", north: "姥爷", cantonese: "公公 / 阿公", minnan: "外公 / 阿公",
      wu: "外公", sichuan: "外公 / 家公", xiang: "外公", hakka: "姐公"
    },
    dadNote: "妈妈的爸爸，南方多叫外公，北方叫姥爷，广东叫公公，川渝还叫家公，客家话叫姐公。"
  },
  {
    id: "waipo", relativeId: "waipo", group: "grand", emoji: "👵", chain: "妈妈的妈妈",
    calls: {
      mandarin: "外婆", north: "姥姥", cantonese: "婆婆 / 阿婆", minnan: "外嬷 / 阿嬷",
      wu: "外婆", sichuan: "外婆 / 家婆", xiang: "外婆", hakka: "姐婆"
    },
    dadNote: "妈妈的妈妈叫法最多样：南方叫外婆，北方叫姥姥，广东叫婆婆，四川叫家婆或家家，客家话叫姐婆。"
  },
  {
    id: "bobo", relativeId: "bobo", group: "dadSide", emoji: "🧔", chain: "爸爸的哥哥",
    calls: {
      mandarin: "伯伯", north: "大爷 / 大伯", cantonese: "阿伯 / 伯父", minnan: "阿伯",
      wu: "伯伯", sichuan: "伯伯", xiang: "伯爹 / 伯伯", hakka: "阿伯"
    },
    dadNote: "爸爸的哥哥叫伯伯，北京和东北很多地方叫大爷，广东和闽南叫阿伯，湖南有的地方叫伯爹。"
  },
  {
    id: "bomu", relativeId: "bomu", group: "dadSide", emoji: "👩", chain: "爸爸的哥哥的老婆",
    calls: {
      mandarin: "伯母", north: "大娘 / 大妈", cantonese: "伯娘", minnan: "阿姆",
      wu: "伯母 / 大妈妈", sichuan: "伯母 / 大娘", xiang: "伯妈", hakka: "阿娘 / 伯姆"
    },
    dadNote: "伯伯的妻子叫伯母，北方常叫大娘或大妈，广东叫伯娘，闽南话里叫阿姆。"
  },
  {
    id: "shushu", relativeId: "shushu", group: "dadSide", emoji: "👨", chain: "爸爸的弟弟",
    calls: {
      mandarin: "叔叔", north: "叔叔 / 老叔", cantonese: "阿叔", minnan: "阿叔",
      wu: "叔叔 / 小叔", sichuan: "叔叔 / 幺爸", xiang: "叔叔 / 满叔", hakka: "阿叔"
    },
    dadNote: "爸爸最小的弟弟，东北叫老叔，川渝叫幺爸，湖南叫满叔，广东和闽南都叫阿叔。"
  },
  {
    id: "gugu", relativeId: "gugu", group: "dadSide", emoji: "👩", chain: "爸爸的姐妹",
    calls: {
      mandarin: "姑姑", north: "姑 / 老姑", cantonese: "姑妈 / 姑姐", minnan: "阿姑",
      wu: "姑妈 / 孃孃", sichuan: "姑姑 / 幺姑", xiang: "姑妈 / 姑姑", hakka: "阿姑"
    },
    dadNote: "爸爸的姐妹通称姑姑。广东分得很细：比爸爸大的叫姑妈，比爸爸小的叫姑姐；苏州一带还叫孃孃。"
  },
  {
    id: "gufu", relativeId: "gufu", group: "dadSide", emoji: "👨", chain: "姑姑的老公",
    calls: {
      mandarin: "姑父", north: "姑父", cantonese: "姑丈", minnan: "姑丈",
      wu: "姑父", sichuan: "姑爹 / 姑父", xiang: "姑爹 / 姑父", hakka: "姑丈 / 姑爷"
    },
    dadNote: "姑姑的丈夫，北方多叫姑父，广东、闽南和客家多叫姑丈，四川和湖南常叫姑爹。"
  },
  {
    id: "jiujiu", relativeId: "jiujiu", group: "momSide", emoji: "👨", chain: "妈妈的兄弟",
    calls: {
      mandarin: "舅舅", north: "舅 / 老舅", cantonese: "舅父", minnan: "阿舅",
      wu: "舅舅", sichuan: "舅舅 / 幺舅", xiang: "舅舅 / 满舅", hakka: "阿舅"
    },
    dadNote: "妈妈的兄弟全国各地都带一个舅字：普通话叫舅舅，东北叫老舅，广东叫舅父，闽南和客家叫阿舅。"
  },
  {
    id: "jiuma", relativeId: "jiuma", group: "momSide", emoji: "👩", chain: "舅舅的老婆",
    calls: {
      mandarin: "舅妈", north: "舅妈 / 妗子", cantonese: "舅母", minnan: "阿妗",
      wu: "舅妈 / 舅姆", sichuan: "舅妈 / 舅娘", xiang: "舅妈", hakka: "舅娘"
    },
    dadNote: "舅舅的妻子叫舅妈，河南、山东、河北很多地方叫妗子，闽南话叫阿妗，广东叫舅母。"
  },
  {
    id: "yima", relativeId: "yima", group: "momSide", emoji: "👩", chain: "妈妈的姐妹",
    calls: {
      mandarin: "姨妈 / 小姨", north: "大姨 / 老姨", cantonese: "姨妈 / 阿姨", minnan: "阿姨",
      wu: "姨妈 / 阿姨", sichuan: "姨妈 / 幺姨", xiang: "姨妈 / 满姨", hakka: "阿姨"
    },
    dadNote: "妈妈的姐妹叫姨妈或小姨，东北管最小的姨叫老姨，川渝叫幺姨，湖南叫满姨。"
  },
  {
    id: "gege", relativeId: "gege", group: "peer", emoji: "👦", chain: "比我大的兄弟",
    calls: {
      mandarin: "哥哥", north: "哥 / 大哥", cantonese: "大佬 / 哥哥", minnan: "阿兄",
      wu: "阿哥 / 哥哥", sichuan: "哥 / 哥哥", xiang: "哥哥 / 老兄", hakka: "阿哥"
    },
    dadNote: "哥哥在广东粤语里常叫大佬，弟弟叫细佬；在闽南话里保留了古汉语的说法，叫阿兄。"
  },
  {
    id: "jiejie", relativeId: "jiejie", group: "peer", emoji: "👧", chain: "比我大的姐妹",
    calls: {
      mandarin: "姐姐", north: "姐 / 大姐", cantonese: "家姐", minnan: "阿姊",
      wu: "阿姐 / 姐姐", sichuan: "姐姐 / 家姐", xiang: "姐姐", hakka: "阿姐"
    },
    dadNote: "姐姐在广东粤语里叫家姐，妹妹叫细妹；闽南话里叫阿姊。"
  }
];

export type DialectTrap = {
  emoji: string;
  word: string;
  title: string;
  text: string;
};

/** 同一个词在南北方指完全不同的人，孩子听起来最好玩。 */
export const dialectTraps: readonly DialectTrap[] = [
  {
    emoji: "😮",
    word: "爹爹",
    title: "“爹爹”是爸爸，还是爷爷？",
    text: "在北方古装剧里，“爹爹”是爸爸；可到了上海、苏州、武汉、长沙，小朋友喊“爹爹”其实是在叫爷爷！"
  },
  {
    emoji: "🤭",
    word: "公公婆婆",
    title: "“公公婆婆”在广东是外公外婆！",
    text: "普通话里“公公、婆婆”是妈妈对爷爷奶奶的称呼；但在广东粤语里，小朋友管自己的外公外婆就叫“公公、婆婆”。"
  },
  {
    emoji: "🎩",
    word: "姑爷",
    title: "南北“姑爷”差了一整辈！",
    text: "在北方，女儿的丈夫（女婿）被叫做“姑爷”；可在福建、客家不少地方，“姑爷”指的是姑姑的丈夫（姑父）。"
  },
  {
    emoji: "🧡",
    word: "幺与满",
    title: "“幺爸”和“满叔”都是最小的那位",
    text: "排行最小的亲戚，东北喜欢加“老”（老叔、老舅），川渝喜欢加“幺”（幺爸、幺姨），湖南则喜欢加“满”（满叔、满姨）。"
  }
];

export const trapSpeech = (trap: DialectTrap) => `${trap.title.replace(/[“”]/g, "")}。${trap.text}`;
