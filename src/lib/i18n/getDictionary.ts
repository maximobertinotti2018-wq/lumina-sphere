import { dictionaries } from './dictionaries';

export type Locale = 'en' | 'es';

export const getDictionary = (locale: Locale) => {
  return dictionaries[locale] || dictionaries['en'];
};
