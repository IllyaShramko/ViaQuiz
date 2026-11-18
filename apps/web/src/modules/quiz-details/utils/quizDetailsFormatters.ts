import { pluralizeUk } from '../../../shared';
import type { QuizQuestion } from '../models';

export interface FormattedQuizDate {
  short: string;
  full: string;
}

export interface QuestionTypeMeta {
  label: string;
  kind: 'single' | 'multiple' | 'typed' | 'letters';
}

/**
 * Normalizes question timeLimit (stored in ms by default) into whole seconds.
 */
export function getQuestionDurationSec(timeLimit?: number | null): number {
  if (!timeLimit || timeLimit <= 0) return 0;
  return timeLimit >= 1000 ? Math.round(timeLimit / 1000) : Math.round(timeLimit);
}

/**
 * Formats estimated total quiz duration across all questions in Ukrainian.
 */
export function formatQuizDuration(questions: QuizQuestion[]): string | null {
  const totalSeconds = questions.reduce(
    (sum, question) => sum + getQuestionDurationSec(question.timeLimit),
    0,
  );

  if (totalSeconds <= 0) return null;
  if (totalSeconds < 60) {
    return `~${totalSeconds} с`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  if (remainingSeconds === 0) {
    return `~${minutes} хв`;
  }

  return `~${minutes} хв ${remainingSeconds} с`;
}

/**
 * Formats an ISO timestamp into concise display text and full hover tooltip.
 */
export function formatQuizDate(dateInput?: string | null): FormattedQuizDate | null {
  if (!dateInput) return null;

  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return null;

  const short = date.toLocaleString('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const full = date.toLocaleString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return { short, full };
}

/**
 * Maps internal QuestionType strings to localized Minimal Pro labels.
 */
export function getQuestionTypeMeta(type?: string): QuestionTypeMeta {
  switch (type) {
    case 'MANY_ANSWERS':
      return { label: 'Кілька відповідей', kind: 'multiple' };
    case 'TYPE_ANSWER_V1':
      return { label: 'Введення відповіді', kind: 'typed' };
    case 'TYPE_ANSWER_V2':
      return { label: 'По літерах', kind: 'letters' };
    case 'ONE_ANSWER':
    default:
      return { label: 'Одна відповідь', kind: 'single' };
  }
}

/**
 * Returns Ukrainian pluralized label for a number of accepted answer variants.
 */
export function formatAnswerVariantsCount(count: number): string {
  return `${count} ${pluralizeUk(count, ['варіант', 'варіанти', 'варіантів'])}`;
}
