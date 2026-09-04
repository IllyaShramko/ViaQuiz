import { z } from 'zod';

export const teacherLoginSchema = z.object({
  email: z.string().trim().min(1, 'Введіть email').email('Невірний формат email'),
  password: z.string().min(1, 'Введіть пароль'),
});

export type TeacherLoginFormData = z.infer<typeof teacherLoginSchema>;

export const studentLoginSchema = z.object({
  login: z.string().trim().min(1, 'Введіть логін'),
  password: z.string().min(1, 'Введіть пароль'),
});

export type StudentLoginFormData = z.infer<typeof studentLoginSchema>;
