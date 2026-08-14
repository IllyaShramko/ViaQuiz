import { useSyncExternalStore, useCallback } from 'react';
import { getLocale, setLocale, subscribe, t as translate, pluralize } from './index';

export function useLocale() {
  const locale = useSyncExternalStore(subscribe, getLocale);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'uk' ? 'en' : 'uk');
  }, [locale]);

  const t = useCallback((key: string): string => {
    return translate(key);
  }, [locale]); // locale dependency ensures re-render on change

  return { locale, setLocale, toggleLocale, t, pluralize };
}
