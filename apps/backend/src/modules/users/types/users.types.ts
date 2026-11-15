import type { Prisma } from "../../../generated/prisma";
import type { z } from "zod";
import type {
	checkUniqueSchema,
	sendCodeSchema,
	registerSchema,
	loginSchema,
	updateProfileSchema,
	sendEmailChangeCodeSchema,
	changeEmailSchema,
	sendPasswordChangeCodeSchema,
	changePasswordSchema,
} from "../user.schema";

export type User = Prisma.UserGetPayload<{
	omit: {
		password: true;
	};
}> & {
	role?: string | undefined;
	classroom?: any | undefined;
	courses?: any | undefined;
};

export type UserWithPassword = Prisma.UserGetPayload<{}>;

export interface CreateUserDTO {
	login: string;
	email: string;
	password: string;
	firstName?: string | null | undefined;
	lastName?: string | null | undefined;
}

export type CheckUniqueDTO = z.infer<typeof checkUniqueSchema>;
export type SendCodeDTO = z.infer<typeof sendCodeSchema>;
export type RegisterCredentials = z.infer<typeof registerSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type SendEmailChangeCodeInput = z.infer<typeof sendEmailChangeCodeSchema>;
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;
export type SendPasswordChangeCodeInput = z.infer<
	typeof sendPasswordChangeCodeSchema
>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export type CheckUniqueResponse = {
	loginIsTaken: boolean;
	emailIsTaken: boolean;
};

export type SendCodeResponse = {
	message: string;
	cooldownSeconds: number;
};

export type TokenDTO = {
	token: string;
	user: User;
};
