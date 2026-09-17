import { z } from "zod";
import { USER_CONSTRAINTS } from "@viaquiz/shared-types";

export const loginFieldSchema = z
	.string()
	.trim()
	.min(
		USER_CONSTRAINTS.LOGIN_MIN_LENGTH,
		`Login must be at least ${USER_CONSTRAINTS.LOGIN_MIN_LENGTH} characters long`,
	)
	.max(
		USER_CONSTRAINTS.LOGIN_MAX_LENGTH,
		`Login cannot exceed ${USER_CONSTRAINTS.LOGIN_MAX_LENGTH} characters`,
	)
	.regex(
		USER_CONSTRAINTS.LOGIN_REGEX,
		"Login can only contain Latin letters, numbers, hyphens, and underscores",
	);

export const emailFieldSchema = z
	.email("Invalid email format")
	.trim()
	.toLowerCase();

export const passwordFieldSchema = z
	.string()
	.min(
		USER_CONSTRAINTS.PASSWORD_MIN_LENGTH,
		`Password must be at least ${USER_CONSTRAINTS.PASSWORD_MIN_LENGTH} characters long`,
	)
	.max(
		USER_CONSTRAINTS.PASSWORD_MAX_LENGTH,
		`Password cannot exceed ${USER_CONSTRAINTS.PASSWORD_MAX_LENGTH} characters`,
	);

export const codeFieldSchema = z
	.string()
	.length(
		USER_CONSTRAINTS.VERIFICATION_CODE_LENGTH,
		`Verification code must be exactly ${USER_CONSTRAINTS.VERIFICATION_CODE_LENGTH} digits`,
	)
	.regex(
		USER_CONSTRAINTS.VERIFICATION_CODE_REGEX,
		"Verification code must contain digits only",
	);

export const checkUniqueSchema = z.object({
	login: loginFieldSchema,
	email: emailFieldSchema,
});

export const sendCodeSchema = z.object({
	email: emailFieldSchema,
});

export const registerSchema = z
	.object({
		login: loginFieldSchema,
		email: emailFieldSchema,
		password: passwordFieldSchema,
		confirmPassword: z.string(),
		firstName: z
			.string()
			.trim()
			.max(
				USER_CONSTRAINTS.FIRST_NAME_MAX_LENGTH,
				`First name cannot exceed ${USER_CONSTRAINTS.FIRST_NAME_MAX_LENGTH} characters`,
			)
			.optional()
			.or(z.literal("")),
		lastName: z
			.string()
			.trim()
			.max(
				USER_CONSTRAINTS.LAST_NAME_MAX_LENGTH,
				`Last name cannot exceed ${USER_CONSTRAINTS.LAST_NAME_MAX_LENGTH} characters`,
			)
			.optional()
			.or(z.literal("")),
		code: codeFieldSchema,
		inviteToken: z.string().optional(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export const loginSchema = z.object({
	email: emailFieldSchema,
	password: z.string().min(1, "Password is required"),
});
