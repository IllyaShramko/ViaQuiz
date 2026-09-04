import { z } from 'zod';

export const createClassSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Назва класу обов'язкова")
    .max(50, 'Назва класу не може перевищувати 50 символів'),
  code: z
    .string()
    .trim()
    .max(10, 'Код не може перевищувати 10 символів')
    .optional()
    .or(z.literal('')),
});

export type CreateClassFormData = z.infer<typeof createClassSchema>;

export const createCourseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Назва курсу обов'язкова")
    .max(100, 'Назва курсу не може перевищувати 100 символів'),
  studentUuids: z.array(z.string()).max(50, 'Курс може містити максимум 50 учнів'),
});

export type CreateCourseFormData = z.infer<typeof createCourseSchema>;

export const inviteTeacherSchema = z.object({
  search: z
    .string()
    .trim()
    .min(1, 'Вкажіть логін або email користувача')
    .max(100, 'Запит занадто довгий'),
});

export type InviteTeacherFormData = z.infer<typeof inviteTeacherSchema>;

export const enrollCourseStudentsSchema = z.object({
  studentUuids: z
    .array(z.string())
    .min(1, 'Оберіть хоча б одного учня')
    .max(50, 'Курс може містити максимум 50 учнів'),
});

export type EnrollCourseStudentsFormData = z.infer<typeof enrollCourseStudentsSchema>;

export const addStudentSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Ім'я обов'язкове")
    .max(50, "Ім'я не може перевищувати 50 символів"),
  lastName: z
    .string()
    .trim()
    .min(1, "Прізвище обов'язкове")
    .max(50, "Прізвище не може перевищувати 50 символів"),
  login: z
    .string()
    .trim()
    .min(3, 'Логін має містити щонайменше 3 символи')
    .max(40, 'Логін не може перевищувати 40 символів')
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      'Логін може містити лише латинські літери, цифри, крапку, дефіс та підкреслення',
    )
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .trim()
    .min(6, 'Пароль має містити щонайменше 6 символів')
    .max(30, 'Пароль не може перевищувати 30 символів')
    .optional()
    .or(z.literal('')),
});

export type AddStudentFormData = z.infer<typeof addStudentSchema>;
