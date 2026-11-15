import { z } from 'zod';

export const PUBLISH_LIMITS = {
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_KEYWORDS: 10,
  MAX_KEYWORD_LENGTH: 50,
  MAX_COVER_SIZE_BYTES: 5 * 1024 * 1024,
} as const;

export const ACCEPTED_COVER_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
] as const;

export const publishQuizSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Введіть назву вікторини')
    .max(
      PUBLISH_LIMITS.MAX_NAME_LENGTH,
      `Назва вікторини не може перевищувати ${PUBLISH_LIMITS.MAX_NAME_LENGTH} символів`,
    ),
  description: z
    .string()
    .trim()
    .max(
      PUBLISH_LIMITS.MAX_DESCRIPTION_LENGTH,
      `Опис не може перевищувати ${PUBLISH_LIMITS.MAX_DESCRIPTION_LENGTH} символів`,
    )
    .optional(),
  coverImg: z.string().nullable().optional(),
  keywords: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(
          PUBLISH_LIMITS.MAX_KEYWORD_LENGTH,
          `Тег не може перевищувати ${PUBLISH_LIMITS.MAX_KEYWORD_LENGTH} символів`,
        ),
    )
    .max(
      PUBLISH_LIMITS.MAX_KEYWORDS,
      `Максимум ${PUBLISH_LIMITS.MAX_KEYWORDS} тегів`,
    ),
});

export type PublishQuizFormData = z.infer<typeof publishQuizSchema>;

export function validateCoverFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Будь ласка, оберіть файл зображення (PNG, JPG, WebP або GIF).';
  }
  if (file.size > PUBLISH_LIMITS.MAX_COVER_SIZE_BYTES) {
    return 'Розмір обкладинки не повинен перевищувати 5 МБ.';
  }
  return null;
}
