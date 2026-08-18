import type { EditorQuestion, EditorQuiz } from '../models/types';

export function validateQuestion(q: EditorQuestion, index: number): string[] {
  const errors: string[] = [];
  const qIndex = index + 1;

  if (!q.text || q.text.trim().length === 0) {
    errors.push(`Питання #${qIndex}: текст запитання не може бути порожнім`);
  }

  const filledVariants = (q.variants || []).filter(
    (v) => v.text && v.text.trim().length > 0
  );
  const correctVariants = (q.variants || []).filter(
    (v) => v.isCorrect && v.text && v.text.trim().length > 0
  );

  if (q.type === 'ONE_ANSWER') {
    if (filledVariants.length < 2) {
      errors.push(`Питання #${qIndex}: додайте щонайменше 2 заповнені варіанти відповідей`);
    }
    if (correctVariants.length !== 1) {
      errors.push(`Питання #${qIndex}: позначте рівно 1 правильний варіант відповіді`);
    }
  } else if (q.type === 'MANY_ANSWERS') {
    if (filledVariants.length < 2) {
      errors.push(`Питання #${qIndex}: додайте щонайменше 2 заповнені варіанти відповідей`);
    }
    if (correctVariants.length < 1) {
      errors.push(`Питання #${qIndex}: позначте хоча б один правильний варіант відповіді`);
    }
  } else if (q.type === 'TYPE_ANSWER_V1' || q.type === 'TYPE_ANSWER_V2') {
    if (correctVariants.length === 0 && filledVariants.length === 0) {
      errors.push(`Питання #${qIndex}: вкажіть правильну відповідь`);
    }
  }

  return errors;
}

export function isQuestionValid(q: EditorQuestion, index = 0): boolean {
  return validateQuestion(q, index).length === 0;
}

export function validateQuiz(quiz: EditorQuiz): string[] {
  const errors: string[] = [];

  if (!quiz.name || quiz.name.trim().length === 0) {
    errors.push('Назва квізу не може бути порожньою');
  }

  if (!quiz.questions || quiz.questions.length === 0) {
    errors.push('Квіз повинен містити щонайменше одне запитання');
    return errors;
  }

  quiz.questions.forEach((q, index) => {
    const qErrors = validateQuestion(q, index);
    errors.push(...qErrors);
  });

  return errors;
}

export function extractPublishErrors(err: unknown): string[] {
  if (!err) return ['Сталася помилка при публікації вікторини.'];

  const apiData = (err as any)?.data;
  const errorObj = apiData?.error;
  const details = errorObj?.details || apiData?.details;

  const extracted: string[] = [];

  if (details?.errors && Array.isArray(details.errors)) {
    details.errors.forEach((e: any) => {
      if (typeof e === 'string') extracted.push(e);
      else if (e?.message) extracted.push(e.message);
    });
  } else if (Array.isArray(details)) {
    details.forEach((e: any) => {
      if (typeof e === 'string') extracted.push(e);
      else if (e?.message) extracted.push(e.message);
    });
  } else if (apiData?.errors && Array.isArray(apiData.errors)) {
    apiData.errors.forEach((e: any) => {
      if (typeof e === 'string') extracted.push(e);
      else if (e?.message) extracted.push(e.message);
    });
  } else if (typeof details === 'string') {
    extracted.push(details);
  } else if (errorObj?.message) {
    extracted.push(errorObj.message);
  } else if (apiData?.message) {
    extracted.push(apiData.message);
  } else if ((err as any)?.message) {
    extracted.push((err as any).message);
  }

  return extracted.length > 0
    ? extracted
    : ['Сталася помилка при публікації вікторини. Перевірте запитання.'];
}
