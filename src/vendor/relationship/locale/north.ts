/**
 * 北方地区称呼数据
 */
import type { TitleData } from '../types.ts';

export interface LocaleData {
  name: string;
  data: TitleData;
}

const north: LocaleData = {
  name: '北方',
  data: {
    'm,m': ['姥姥'],
    'm,m,xs': ['姨姥姥'],
    'm,m,xs,h': ['姨姥爷'],
    'm,m,xb': ['舅姥爷'],
    'm,m,xb,w': ['舅姥姥'],
    'm,f': ['姥爷'],
    'm,f,xs': ['姑姥姥'],
    'm,f,xs,h': ['姑姥爷'],
    'm,f,ob': ['大姥爷'],
    'm,f,ob,w': ['大姥姥'],
    'm,f,lb': ['小姥爷'],
    'm,f,lb,w': ['小姥姥'],
    'f,ob': ['大爷'],
    'f,ob,w': ['大娘'],
  },
};

export default north;
