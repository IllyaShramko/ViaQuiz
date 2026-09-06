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

export type PluralWords =
  | { uk: [string, string, string]; en: [string, string] }
  | [string, string, string];

/**
 * Ukrainian pluralization logic:
 * [1, 2-4, 5+] (e.g. 1 question, 2-4 questions, 5+ questions)
 */
export function pluralizeUk(
  count: number,
  forms: [string, string, string],
): string {
  const abs = Math.abs(count);
  const mod10 = abs % 10;
  const mod100 = abs % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return forms[0];
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return forms[1];
  }
  return forms[2];
}

export function pluralize(
  count: number,
  words: PluralWords,
  locale?: Locale,
): string {
  if (Array.isArray(words)) {
    return pluralizeUk(count, words);
  }
  const activeLocale = locale || currentLocale;
  if (activeLocale === 'en') {
    return Math.abs(count) === 1 ? words.en[0] : words.en[1];
  }
  return pluralizeUk(count, words.uk);
}

export function formatPlural(
  count: number,
  words: PluralWords,
  locale?: Locale,
): string {
  return `${count} ${pluralize(count, words, locale)}`;
}

export function pluralizeQuestions(count: number, withCount = false): string {
  const word = pluralize(count, {
    uk: ['запитання', 'запитання', 'запитань'],
    en: ['question', 'questions'],
  });
  return withCount ? `${count} ${word}` : word;
}

export function pluralizeAnswers(count: number, withCount = false): string {
  const word = pluralize(count, {
    uk: ['відповідь', 'відповіді', 'відповідей'],
    en: ['answer', 'answers'],
  });
  return withCount ? `${count} ${word}` : word;
}

export function pluralizePoints(count: number, withCount = false): string {
  const word = pluralize(count, {
    uk: ['бал', 'бали', 'балів'],
    en: ['point', 'points'],
  });
  return withCount ? `${count} ${word}` : word;
}

export function pluralizeParticipants(count: number, withCount = false): string {
  const word = pluralize(count, {
    uk: ['учасник', 'учасники', 'учасників'],
    en: ['participant', 'participants'],
  });
  return withCount ? `${count} ${word}` : word;
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export { LocaleContext, LocaleProvider, useLocale } from './LocaleContext';
