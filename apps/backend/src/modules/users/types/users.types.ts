import type { Prisma } from "../../../generated/prisma/client.js";
import type { z } from "zod";
import type { registerSchema, loginSchema } from "../user.schema";

export type User = Prisma.UserGetPayload<{
	omit: {
		password: true;
	};
}>;

export type UserWithPassword = Prisma.UserGetPayload<{}>;

export interface CreateUserDTO {
	email: string;
	password: string;
	username?: string | undefined;
}

export type RegisterCredentials = z.infer<typeof registerSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

export type TokenDTO = {
	token: string;
	user: User;
};
