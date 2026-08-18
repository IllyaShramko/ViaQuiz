import { z } from "zod";

export const loginFieldSchema = z
	.string()
	.trim()
	.min(3, "Login must be at least 3 characters long")
	.max(20, "Login cannot exceed 20 characters")
	.regex(
		/^[a-zA-Z0-9_-]+$/,
		"Login can only contain Latin letters, numbers, hyphens, and underscores",
	);

export const emailFieldSchema = z
	.email("Invalid email format")
	.trim()
	.toLowerCase();

export const passwordFieldSchema = z
	.string()
	.min(6, "Password must be at least 6 characters long")
	.max(64, "Password cannot exceed 64 characters");

export const codeFieldSchema = z
	.string()
	.length(6, "Verification code must be exactly 6 digits")
	.regex(/^\d{6}$/, "Verification code must contain digits only");

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
			.max(50, "First name cannot exceed 50 characters")
			.optional()
			.or(z.literal("")),
		lastName: z
			.string()
			.trim()
			.max(50, "Last name cannot exceed 50 characters")
			.optional()
			.or(z.literal("")),
		code: codeFieldSchema,
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export const loginSchema = z.object({
	email: emailFieldSchema,
	password: z.string().min(1, "Password is required"),
});
