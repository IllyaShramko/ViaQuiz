import { z } from "zod";

export const createRoomSchema = z.object({
	quizId: z.number().int().positive("Quiz ID is required"),
	courseId: z.number().int().positive().nullable().optional(),
	classroomId: z.number().int().positive().nullable().optional(),
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
	gameToken: z.string().optional(),
});

export const validateJoinCodeSchema = z.object({
	joinCode: z
		.string()
		.trim()
		.length(6, "PIN code must be exactly 6 digits")
		.regex(/^\d+$/, "PIN code must contain only numbers"),
});

export const submitAnswerSchema = z
	.object({
		roomId: z.number().int().positive(),
		questionIndex: z.number().int().min(0),
		variantIds: z.array(z.number().int().positive()).optional(),
		typedAnswer: z.string().trim().optional(),
	})
	.refine(
		(data) =>
			(data.variantIds && data.variantIds.length > 0) ||
			(typeof data.typedAnswer === "string" && data.typedAnswer.length > 0),
		{ message: "Either variantIds or typedAnswer must be provided" },
	);
