import { z } from "zod";

export const studentLoginSchema = z.object({
	login: z.string().trim().min(1, "Логін обов'язковий"),
	password: z.string().min(1, "Пароль обов'язковий"),
	classCode: z.string().trim().optional(),
});
