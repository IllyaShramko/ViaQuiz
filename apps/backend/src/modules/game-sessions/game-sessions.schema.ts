import { z } from "zod";

export const createRoomSchema = z.object({
	quizId: z.number().int().positive("Quiz ID is required"),
	courseId: z.number().int().positive().nullable().optional(),
});

export const joinRoomSchema = z.object({
	joinCode: z
		.string()
		.trim()
		.length(6, "PIN code must be exactly 6 digits")
		.regex(/^\d+$/, "PIN code must contain only numbers"),
	nickname: z
		.string()
		.trim()
		.min(2, "Nickname must be at least 2 characters")
		.max(30, "Nickname cannot exceed 30 characters")
		.optional(),
});

export const validateJoinCodeSchema = z.object({
	joinCode: z
		.string()
		.trim()
		.length(6, "PIN code must be exactly 6 digits")
		.regex(/^\d+$/, "PIN code must contain only numbers"),
});

export const submitAnswerSchema = z.object({
	roomId: z.number().int().positive(),
	questionIndex: z.number().int().min(0),
	variantIds: z.array(z.number().int().positive()).min(1, "Select at least one answer"),
});
