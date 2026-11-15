import { z } from 'zod';
import { USER_CONSTRAINTS } from '@viaquiz/shared-types';

export const profileSettingsSchema = z.object({
  firstName: z
    .string()
    .trim()
    .max(
      USER_CONSTRAINTS.FIRST_NAME_MAX_LENGTH,
      `Ім'я не може перевищувати ${USER_CONSTRAINTS.FIRST_NAME_MAX_LENGTH} символів`,
    ),
  lastName: z
    .string()
    .trim()
    .max(
      USER_CONSTRAINTS.LAST_NAME_MAX_LENGTH,
      `Прізвище не може перевищувати ${USER_CONSTRAINTS.LAST_NAME_MAX_LENGTH} символів`,
    ),
});

export type ProfileSettingsFormData = z.infer<typeof profileSettingsSchema>;

export const requestEmailChangeSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Введіть нову електронну пошту')
    .email('Невірний формат email'),
});

export type RequestEmailChangeFormData = z.infer<typeof requestEmailChangeSchema>;

export const confirmEmailChangeSchema = z.object({
  code: z
    .string()
    .trim()
    .length(
      USER_CONSTRAINTS.VERIFICATION_CODE_LENGTH,
      `Код має містити ${USER_CONSTRAINTS.VERIFICATION_CODE_LENGTH} цифр`,
    )
    .regex(USER_CONSTRAINTS.VERIFICATION_CODE_REGEX, 'Код має містити лише цифри'),
});

export type ConfirmEmailChangeFormData = z.infer<typeof confirmEmailChangeSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Введіть поточний пароль'),
    newPassword: z
      .string()
      .min(
        USER_CONSTRAINTS.PASSWORD_MIN_LENGTH,
        `Пароль має містити щонайменше ${USER_CONSTRAINTS.PASSWORD_MIN_LENGTH} символів`,
      )
      .max(
        USER_CONSTRAINTS.PASSWORD_MAX_LENGTH,
        `Пароль не може перевищувати ${USER_CONSTRAINTS.PASSWORD_MAX_LENGTH} символів`,
      ),
    confirmNewPassword: z.string().min(1, 'Підтвердіть новий пароль'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Паролі не співпадають',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'Новий пароль має відрізнятися від поточного',
    path: ['newPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
