import { z } from "zod";

export const createQuizSchema = z.object({
	name: z
		.string()
		.trim()
		.max(100, "Quiz name cannot exceed 100 characters")
		.optional()
		.default("Новий квіз"),
	description: z
		.string()
		.trim()
		.max(500, "Description cannot exceed 500 characters")
		.optional(),
	coverImg: z.string().url("Invalid image URL").optional().or(z.literal("")),
	keywords: z
		.array(z.string().trim().min(1).max(50))
		.max(10, "Cannot have more than 10 tags")
		.optional(),
});

export const updateQuizSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Quiz name cannot be empty")
		.max(100, "Quiz name cannot exceed 100 characters")
		.optional(),
	description: z
		.string()
		.trim()
		.max(500, "Description cannot exceed 500 characters")
		.nullable()
		.optional(),
	coverImg: z
		.string()
		.url("Invalid image URL")
		.nullable()
		.optional()
		.or(z.literal("")),
	keywords: z
		.array(z.string().trim().min(1).max(50))
		.max(10, "Cannot have more than 10 tags")
		.optional(),
});

export const quizQuerySchema = z.object({
	isDraft: z
		.enum(["true", "false"])
		.transform((val) => val === "true")
		.optional(),
	search: z.string().trim().optional(),
});
