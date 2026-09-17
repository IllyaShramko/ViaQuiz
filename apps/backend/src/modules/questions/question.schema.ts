import { z } from "zod";
import {
	QUESTION_TYPES,
	VARIANT_TYPES,
	QUESTION_LIMITS,
	MAX_QUESTION_VARIANTS,
} from "@viaquiz/shared-types";

export const questionTypeEnum = z.enum(QUESTION_TYPES);

export const variantTypeEnum = z.enum(VARIANT_TYPES);

export const variantSchema = z.object({
	id: z.number().int().positive().optional(),
	text: z
		.string()
		.max(
			QUESTION_LIMITS.MAX_VARIANT_TEXT_LENGTH,
			`Variant text cannot exceed ${QUESTION_LIMITS.MAX_VARIANT_TEXT_LENGTH} characters`,
		)
		.nullable()
		.optional(),
	media: z.url("Invalid media URL").nullable().optional().or(z.literal("")),
	type: variantTypeEnum.default("TEXT"),
	isCorrect: z.boolean().default(false),
	order: z.number().int().min(0).default(0),
});

export const createQuestionSchema = z.object({
	type: questionTypeEnum.default("ONE_ANSWER"),
	text: z
		.string()
		.max(1000, "Question text cannot exceed 1000 characters")
		.optional()
		.default(""),
	media: z.url("Invalid media URL").nullable().optional().or(z.literal("")),
	timeLimit: z.number().int().min(1000).max(600000).default(30000),
	points: z.number().int().min(0).max(5000).default(1000),
	variants: z
		.array(variantSchema)
		.max(
			MAX_QUESTION_VARIANTS,
			`Cannot exceed ${MAX_QUESTION_VARIANTS} variants`,
		)
		.optional(),
});

export const updateQuestionSchema = z.object({
	text: z
		.string()
		.max(1000, "Question text cannot exceed 1000 characters")
		.optional(),
	media: z.url("Invalid media URL").nullable().optional().or(z.literal("")),
	type: questionTypeEnum.optional(),
	timeLimit: z.number().int().min(1000).max(600000).optional(),
	points: z.number().int().min(0).max(5000).optional(),
	variants: z
		.array(variantSchema)
		.max(
			MAX_QUESTION_VARIANTS,
			`Cannot exceed ${MAX_QUESTION_VARIANTS} variants`,
		)
		.optional(),
});

export const reorderQuestionsSchema = z.object({
	questionIds: z
		.array(z.number().int().positive())
		.min(1, "Must provide at least one question ID to reorder"),
});
