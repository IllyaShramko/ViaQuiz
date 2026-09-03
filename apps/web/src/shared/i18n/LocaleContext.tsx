import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import {
  type Locale,
  type PluralWords,
  getLocale as getStoredLocale,
  setLocale as setStoredLocale,
  toggleLocale as toggleStoredLocale,
  subscribe,
  t as translateKey,
  pluralize as pluralizeKey,
  formatPlural as formatPluralKey,
} from './index';

export interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string) => string;
  pluralize: (count: number, words: PluralWords) => string;
  formatPlural: (count: number, words: PluralWords) => string;
}

export const LocaleContext = createContext<LocaleContextType | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getStoredLocale());

  useEffect(() => {
    // Sync React state with external changes
    const unsubscribe = subscribe(() => {
      setLocaleState(getStoredLocale());
    });
    return unsubscribe;
  }, []);

  const setLocale = useCallback((nextLocale: Locale) => {
    setStoredLocale(nextLocale);
    setLocaleState(nextLocale);
  }, []);

  const toggleLocale = useCallback(() => {
    const nextLocale = locale === 'uk' ? 'en' : 'uk';
    setStoredLocale(nextLocale);
    setLocaleState(nextLocale);
  }, [locale]);

  const t = useCallback(
    (key: string): string => {
      return translateKey(key, locale);
    },
    [locale],
  );

  const pluralize = useCallback(
    (count: number, words: PluralWords): string => {
      return pluralizeKey(count, words, locale);
    },
    [locale],
  );

  const formatPlural = useCallback(
    (count: number, words: PluralWords): string => {
      return formatPluralKey(count, words, locale);
    },
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t,
      pluralize,
      formatPlural,
    }),
    [locale, setLocale, toggleLocale, t, pluralize, formatPlural],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextType {
  const context = useContext(LocaleContext);
  if (context) {
    return context;
  }

  // Fallback if rendered outside LocaleProvider
  return {
    locale: getStoredLocale(),
    setLocale: setStoredLocale,
    toggleLocale: toggleStoredLocale,
    t: (key: string) => translateKey(key),
    pluralize: (count, words) => pluralizeKey(count, words),
    formatPlural: (count, words) => formatPluralKey(count, words),
  };
}
