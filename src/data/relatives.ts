export type Step = "爸爸" | "妈妈" | "哥哥" | "姐姐" | "弟弟" | "妹妹" | "儿子" | "女儿" | "老公" | "老婆";

/** 0 女孩，1 男孩，和 relationship 库的 sex 参数一致。 */
export type Sex = 0 | 1;

/** 玩的人就是小念，小念是男孩。 */
export const me: Sex = 1;

export type Side = "dad" | "mom" | "home";

/** 0 是家里人，只在家族树里出现；1–3 对应闯关的入门、进阶、挑战。 */
export type Level = 0 | 1 | 2 | 3;

export type Relative = {
  id: string;
  /** 从"我"出发的关系链，如 ["妈妈", "哥哥"]。 */
  steps: readonly Step[];
  /** 孩子平时的叫法，必须是 relationship 库认得的称呼（tests/kinship.test.mjs 会核对）。 */
  call: string;
  /** 书面或别的地方的叫法。 */
  also?: readonly string[];
  emoji: string;
  male: boolean;
  /** 相对于我的辈分：2 祖辈，1 父辈，0 同辈，-1 晚辈。 */
  gen: number;
  side: Side;
  level: Level;
  /** 同辈堂表亲要看比你大还是小，才分得出哥哥还是弟弟。 */
  age?: "older" | "younger";
  /** TA 叫你什么：[男孩, 女孩]。 */
  calledMe: readonly [string, string];
  /** false：TA 叫你的称呼太大人化，不拿来出"TA叫你什么"的题。 */
  askBack?: boolean;
  /** 有的地方叫法相同，不能互相当干扰项。 */
  notWith?: readonly string[];
  /** 爸爸的讲解。 */
  tip: string;
};

export const relatives: readonly Relative[] = [
  // 家里人
  {
    id: "dad", steps: ["爸爸"], call: "爸爸", emoji: "👨", male: true, gen: 1, side: "home", level: 0,
    calledMe: ["儿子", "女儿"], tip: "我就是你爸爸！在爷爷奶奶眼里，我是他们的儿子。"
  },
  {
    id: "mom", steps: ["妈妈"], call: "妈妈", emoji: "👩", male: false, gen: 1, side: "home", level: 0,
    calledMe: ["儿子", "女儿"], tip: "在外公外婆眼里，妈妈是他们的女儿。"
  },
  {
    id: "gege", steps: ["哥哥"], call: "哥哥", emoji: "👦", male: true, gen: 0, side: "home", level: 0,
    calledMe: ["弟弟", "妹妹"], tip: "比你大的男孩子是哥哥，你就是他的弟弟或者妹妹。"
  },
  {
    id: "jiejie", steps: ["姐姐"], call: "姐姐", emoji: "👧", male: false, gen: 0, side: "home", level: 0,
    calledMe: ["弟弟", "妹妹"], tip: "比你大的女孩子是姐姐，你就是她的弟弟或者妹妹。"
  },

  // 入门
  {
    id: "yeye", steps: ["爸爸", "爸爸"], call: "爷爷", also: ["祖父"], emoji: "👴", male: true, gen: 2, side: "dad", level: 1,
    calledMe: ["孙子", "孙女"], tip: "爸爸的爸爸叫爷爷，爸爸的妈妈叫奶奶。你是他们的孙子或者孙女。"
  },
  {
    id: "nainai", steps: ["爸爸", "妈妈"], call: "奶奶", also: ["祖母"], emoji: "👵", male: false, gen: 2, side: "dad", level: 1,
    calledMe: ["孙子", "孙女"], tip: "爸爸的妈妈叫奶奶。奶奶就是爸爸小时候天天喊的“妈”。"
  },
  {
    id: "waigong", steps: ["妈妈", "爸爸"], call: "外公", also: ["姥爷", "外祖父"], emoji: "👴", male: true, gen: 2, side: "mom", level: 1,
    calledMe: ["外孙", "外孙女"], tip: "妈妈的爸爸妈妈，前面多一个“外”字：外公、外婆。北方很多地方叫姥爷、姥姥。"
  },
  {
    id: "waipo", steps: ["妈妈", "妈妈"], call: "外婆", also: ["姥姥", "外祖母"], emoji: "👵", male: false, gen: 2, side: "mom", level: 1,
    calledMe: ["外孙", "外孙女"], tip: "妈妈的妈妈叫外婆，北方叫姥姥。你是外婆的外孙或者外孙女。"
  },
  {
    id: "bobo", steps: ["爸爸", "哥哥"], call: "伯伯", also: ["伯父"], emoji: "🧔", male: true, gen: 1, side: "dad", level: 1,
    calledMe: ["侄子", "侄女"], tip: "爸爸的哥哥叫伯伯，爸爸的弟弟叫叔叔。记住：比爸爸大是“伯”，比爸爸小是“叔”。"
  },
  {
    id: "shushu", steps: ["爸爸", "弟弟"], call: "叔叔", also: ["叔父"], emoji: "👨", male: true, gen: 1, side: "dad", level: 1,
    calledMe: ["侄子", "侄女"], tip: "爸爸的弟弟叫叔叔。路上遇到的大人你也会礼貌地叫叔叔，不过那就不是亲戚啦。"
  },
  {
    id: "gugu", steps: ["爸爸", "妹妹"], call: "姑姑", also: ["小姑", "姑妈"], emoji: "👩", male: false, gen: 1, side: "dad", level: 1,
    calledMe: ["侄子", "侄女"], tip: "爸爸的姐姐、妹妹都叫姑姑。比爸爸大的叫大姑，比爸爸小的叫小姑。"
  },
  {
    id: "jiujiu", steps: ["妈妈", "哥哥"], call: "舅舅", also: ["大舅", "舅父"], emoji: "👨", male: true, gen: 1, side: "mom", level: 1,
    calledMe: ["外甥", "外甥女"], tip: "妈妈的哥哥、弟弟都叫舅舅。比妈妈大的叫大舅，比妈妈小的叫小舅。"
  },
  {
    id: "yima", steps: ["妈妈", "姐姐"], call: "姨妈", also: ["大姨", "姨母"], emoji: "👩", male: false, gen: 1, side: "mom", level: 1,
    calledMe: ["外甥", "外甥女"], tip: "妈妈的姐姐、妹妹都是“姨”。比妈妈大的叫大姨、姨妈，比妈妈小的叫小姨。"
  },

  // 进阶
  {
    id: "bomu", steps: ["爸爸", "哥哥", "老婆"], call: "伯母", also: ["大妈", "大娘"], emoji: "👩", male: false, gen: 1, side: "dad", level: 2,
    calledMe: ["侄子", "侄女"], tip: "伯伯的老婆叫伯母，有的地方叫大妈、大娘。"
  },
  {
    id: "shenshen", steps: ["爸爸", "弟弟", "老婆"], call: "婶婶", also: ["婶子"], emoji: "👩", male: false, gen: 1, side: "dad", level: 2,
    calledMe: ["侄子", "侄女"], tip: "叔叔的老婆叫婶婶。伯伯配伯母，叔叔配婶婶。"
  },
  {
    id: "gufu", steps: ["爸爸", "妹妹", "老公"], call: "姑父", also: ["姑丈"], emoji: "👨", male: true, gen: 1, side: "dad", level: 2,
    calledMe: ["侄子", "侄女"], tip: "姑姑的老公叫姑父：姑姑的“姑”，后面加一个“父”字。"
  },
  {
    id: "jiuma", steps: ["妈妈", "哥哥", "老婆"], call: "舅妈", also: ["舅母"], emoji: "👩", male: false, gen: 1, side: "mom", level: 2,
    calledMe: ["外甥", "外甥女"], tip: "舅舅的老婆叫舅妈：舅舅的“舅”，后面加一个“妈”字。"
  },
  {
    id: "yifu", steps: ["妈妈", "姐姐", "老公"], call: "姨父", also: ["姨丈"], emoji: "👨", male: true, gen: 1, side: "mom", level: 2,
    calledMe: ["外甥", "外甥女"], tip: "姨妈的老公叫姨父。和姑父一样，在“姨”后面加一个“父”字。"
  },
  {
    id: "tangge", steps: ["爸爸", "哥哥", "儿子"], call: "堂哥", emoji: "👦", male: true, gen: 0, side: "dad", level: 2, age: "older",
    calledMe: ["堂弟", "堂妹"], tip: "伯伯、叔叔家的孩子，是你的堂哥、堂姐、堂弟、堂妹。你们的爷爷是同一个人，通常还和你一个姓。"
  },
  {
    id: "tangmei", steps: ["爸爸", "弟弟", "女儿"], call: "堂妹", emoji: "👧", male: false, gen: 0, side: "dad", level: 2, age: "younger",
    calledMe: ["堂哥", "堂姐"], tip: "叔叔的女儿比你小，就是你的堂妹。只有爸爸的哥哥弟弟家的孩子，才叫“堂”。"
  },
  {
    id: "biaojie", steps: ["爸爸", "妹妹", "女儿"], call: "表姐", also: ["姑表姐"], emoji: "👧", male: false, gen: 0, side: "dad", level: 2, age: "older",
    calledMe: ["表弟", "表妹"], tip: "姑姑家的孩子是“表”亲，不是“堂”亲。虽然在爸爸这边，可只有爸爸的哥哥弟弟家的孩子才算“堂”。"
  },
  {
    id: "biaodi", steps: ["妈妈", "哥哥", "儿子"], call: "表弟", also: ["舅表弟"], emoji: "👦", male: true, gen: 0, side: "mom", level: 2, age: "younger",
    calledMe: ["表哥", "表姐"], tip: "舅舅家的孩子也是表亲。妈妈那边的兄弟姐妹家的孩子，全都叫表哥、表姐、表弟、表妹。"
  },
  {
    id: "biaomei", steps: ["妈妈", "姐姐", "女儿"], call: "表妹", emoji: "👧", male: false, gen: 0, side: "mom", level: 2, age: "younger",
    calledMe: ["表哥", "表姐"], tip: "姨妈的女儿比你小，就是你的表妹。“堂”只在爸爸的兄弟家，其他都是“表”。"
  },
  {
    id: "saozi", steps: ["哥哥", "老婆"], call: "嫂子", emoji: "👩", male: false, gen: 0, side: "home", level: 2, askBack: false,
    calledMe: ["小叔子", "小姑子"], tip: "哥哥的老婆叫嫂子。平时她多半直接叫你的名字。"
  },
  {
    id: "jiefu", steps: ["姐姐", "老公"], call: "姐夫", emoji: "👨", male: true, gen: 0, side: "home", level: 2, askBack: false,
    calledMe: ["小舅子", "小姨子"], tip: "姐姐的老公叫姐夫。按规矩，他管你叫小舅子或者小姨子。"
  },
  {
    id: "zhizi", steps: ["哥哥", "儿子"], call: "侄子", emoji: "👶", male: true, gen: -1, side: "home", level: 2,
    calledMe: ["叔叔", "小姑"], tip: "哥哥的儿子叫侄子。这时候你就升级当叔叔或者姑姑啦，虽然你可能还在上学！"
  },
  {
    id: "waishengnv", steps: ["姐姐", "女儿"], call: "外甥女", emoji: "👶", male: false, gen: -1, side: "home", level: 2,
    calledMe: ["小舅", "小姨"], tip: "姐姐的孩子叫外甥、外甥女。你是她妈妈的弟弟妹妹，所以她叫你小舅或者小姨。"
  },

  // 挑战
  {
    id: "taiyeye", steps: ["爸爸", "爸爸", "爸爸"], call: "太爷爷", also: ["曾祖父"], emoji: "👴", male: true, gen: 3, side: "dad", level: 3,
    calledMe: ["曾孙", "曾孙女"], tip: "爷爷的爸爸叫太爷爷，书上写作曾祖父。你是他的曾孙或者曾孙女。"
  },
  {
    id: "tainainai", steps: ["爸爸", "爸爸", "妈妈"], call: "太奶奶", also: ["曾祖母"], emoji: "👵", male: false, gen: 3, side: "dad", level: 3,
    calledMe: ["曾孙", "曾孙女"], tip: "爷爷的妈妈叫太奶奶。比爷爷奶奶再高一辈，就在前面加一个“太”字。"
  },
  {
    id: "dayeye", steps: ["爸爸", "爸爸", "哥哥"], call: "大爷爷", also: ["伯公", "伯祖父"], emoji: "👴", male: true, gen: 2, side: "dad", level: 3,
    calledMe: ["侄孙", "侄孙女"], tip: "爷爷的哥哥叫大爷爷，有的地方叫伯公。就像爸爸的哥哥叫伯伯，再往上一辈就成了“伯公”。"
  },
  {
    id: "gunainai", steps: ["爸爸", "爸爸", "妹妹"], call: "姑奶奶", also: ["姑婆"], emoji: "👵", male: false, gen: 2, side: "dad", level: 3,
    calledMe: ["侄孙", "侄孙女"], tip: "爷爷的姐妹叫姑奶奶，南方叫姑婆。她是爸爸的姑姑，再往上一辈就是你的姑奶奶。"
  },
  {
    id: "jiuyeye", steps: ["爸爸", "妈妈", "哥哥"], call: "舅爷爷", also: ["舅爷", "大舅爷"], emoji: "👴", male: true, gen: 2, side: "dad", level: 3,
    notWith: ["jiugong"],
    calledMe: ["甥孙", "甥孙女"], tip: "奶奶的哥哥弟弟，是爸爸的舅舅。爸爸叫他舅舅，你就叫他舅爷爷。"
  },
  {
    id: "jiugong", steps: ["妈妈", "妈妈", "哥哥"], call: "舅公", also: ["舅外公", "舅姥爷"], emoji: "👴", male: true, gen: 2, side: "mom", level: 3,
    notWith: ["jiuyeye"],
    calledMe: ["甥外孙", "甥外孙女"], tip: "外婆的哥哥弟弟，是妈妈的舅舅。你叫他舅公，北方叫舅姥爷。"
  },
  {
    id: "yipo", steps: ["妈妈", "妈妈", "妹妹"], call: "姨婆", also: ["姨外婆", "姨姥姥"], emoji: "👵", male: false, gen: 2, side: "mom", level: 3,
    calledMe: ["甥外孙", "甥外孙女"], tip: "外婆的姐妹，是妈妈的姨妈。你叫她姨婆，北方叫姨姥姥。"
  }
];

const byId = new Map(relatives.map((relative) => [relative.id, relative]));

export function relativeById(id: string | undefined): Relative | undefined {
  return id ? byId.get(id) : undefined;
}

export const stepsText = (steps: readonly string[]) => steps.join("的");

export const calledMeFor = (relative: Relative, sex: Sex) => relative.calledMe[sex === 1 ? 0 : 1];

const byChain = new Map(relatives.map((relative) => [stepsText(relative.steps), relative]));

export function relativeBySteps(steps: readonly string[]): Relative | undefined {
  return byChain.get(stepsText(steps));
}

export const sideNames: Record<Side, string> = { dad: "爸爸家", mom: "妈妈家", home: "我家" };

export const levels = [
  { level: 1, title: "入门", emoji: "🌱", hook: "爷爷奶奶、外公外婆、伯伯舅舅", count: 6 },
  { level: 2, title: "进阶", emoji: "🌿", hook: "舅妈姑父、堂哥表妹，还有嫂子姐夫", count: 8 },
  { level: 3, title: "挑战", emoji: "🌳", hook: "太爷爷、舅公，还要猜亲戚叫你什么", count: 8 }
] as const;

export type QuizLevel = (typeof levels)[number]["level"];
