import uk from './locales/uk.json';
import en from './locales/en.json';

export type Locale = 'uk' | 'en';

type NestedRecord = { [key: string]: string | NestedRecord | any };

export const translations: Record<Locale, NestedRecord> = {
  uk,
  en,
};

function getNestedValue(obj: NestedRecord, path: string): string {
  const result = path.split('.').reduce<string | NestedRecord | undefined>(
    (acc, key) => {
      if (acc === undefined || typeof acc === 'string') return undefined;
      return acc[key];
    },
    obj,
  );
  return typeof result === 'string' ? result : path;
}

const STORAGE_KEY = 'viaquiz-locale';

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'uk';
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'uk' || saved === 'en') return saved;
  const browserLang = navigator.language?.toLowerCase() || '';
  return browserLang.startsWith('uk') ? 'uk' : 'en';
}

let currentLocale: Locale = getInitialLocale();
const listeners: Set<() => void> = new Set();

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  if (currentLocale === locale) return;
  currentLocale = locale;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }
  listeners.forEach((fn) => fn());
}

export function toggleLocale(): void {
  setLocale(currentLocale === 'uk' ? 'en' : 'uk');
}

export function t(key: string, locale?: Locale): string {
  const activeLocale = locale || currentLocale;
  return getNestedValue(translations[activeLocale], key);
}

export function pluralize(
  count: number,
  words: { uk: [string, string, string]; en: [string, string] },
  locale?: Locale,
): string {
  const activeLocale = locale || currentLocale;
  if (activeLocale === 'en') {
    return count === 1 ? words.en[0] : words.en[1];
  }
  // Ukrainian pluralization rules
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return words.uk[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return words.uk[1];
  return words.uk[2];
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export { LocaleContext, LocaleProvider, useLocale } from './LocaleContext';
