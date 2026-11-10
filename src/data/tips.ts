export type Tip = { emoji: string; title: string; text: string };

export const tipSpeech = (tip: Tip) => `${tip.title.replace(/[“”]/g, "")}。${tip.text}`;

/** 首页"爸爸的认亲口诀"。每一句都要和 relatives.ts 里的叫法一致。 */
export const tips: readonly Tip[] = [
  { emoji: "🌸", title: "妈妈那边加个“外”", text: "妈妈的爸爸妈妈叫外公、外婆，你是他们的外孙、外孙女。北方叫姥爷、姥姥。" },
  { emoji: "📏", title: "伯和叔，看大小", text: "爸爸的哥哥叫伯伯，爸爸的弟弟叫叔叔。比爸爸大是“伯”，比爸爸小是“叔”。" },
  { emoji: "👭", title: "姑、舅、姨", text: "爸爸的姐妹是姑姑；妈妈的兄弟是舅舅，妈妈的姐妹是姨妈、小姨。" },
  { emoji: "💍", title: "结了婚换个字", text: "伯伯配伯母，叔叔配婶婶，舅舅配舅妈；姑姑、姨妈的老公，叫姑父、姨父。" },
  { emoji: "🏠", title: "“堂”只有一种", text: "只有伯伯、叔叔家的孩子是堂哥堂姐；姑姑、舅舅、姨妈家的孩子，都是表哥表姐。" },
  { emoji: "⬆️", title: "往上一辈加个字", text: "爷爷的爸爸是太爷爷；爷爷的哥哥是大爷爷；外婆的哥哥是舅公。" }
];
