import { cookies } from 'next/headers';
import { dictionaries } from './dictionaries';
import { Locale } from './getDictionary';

export async function serverT() {
  const cookieStore = cookies();
  const lang = (cookieStore.get('lumina-locale')?.value || 'en') as Locale;
  const dictionary = dictionaries[lang] || dictionaries.en;

  return (key: string): string => {
    const keys = key.split('.');
    let value: any = dictionary;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation missing for key: ${key} in ${lang}`);
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  };
}
