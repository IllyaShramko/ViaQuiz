import { PRISMA_CLIENT } from "../../config/database";
import { errorValidator } from "../../errors/errorValidator";
import type { QuestionRepositoryContract } from "./types/questions.contracts";

const questionIncludeVariants = {
	variants: {
		orderBy: { order: "asc" as const },
	},
};

export const QuestionRepository: QuestionRepositoryContract = {
	async create(quizId, data) {
		try {
			const type = data.type || "ONE_ANSWER";
			const timeLimitSec = data.timeLimitSec || 30;
			const points = data.points !== undefined ? data.points : 1000;

			// Find current max order
			const lastQuestion = await PRISMA_CLIENT.question.findFirst({
				where: { quizId },
				orderBy: { order: "desc" },
				select: { order: true },
			});
			const nextOrder = lastQuestion !== null ? lastQuestion.order + 1 : 0;

			let defaultVariants = data.variants;
			if (!defaultVariants || defaultVariants.length === 0) {
				if (type === "ONE_ANSWER" || type === "MANY_ANSWERS") {
					defaultVariants = [
						{ text: "", isCorrect: false, order: 0, type: "TEXT" },
						{ text: "", isCorrect: false, order: 1, type: "TEXT" },
						{ text: "", isCorrect: false, order: 2, type: "TEXT" },
						{ text: "", isCorrect: false, order: 3, type: "TEXT" },
					];
				} else {
					// TYPE_ANSWER_V1 / TYPE_ANSWER_V2
					defaultVariants = [
						{ text: "", isCorrect: true, order: 0, type: "TEXT" },
					];
				}
			}

			return await PRISMA_CLIENT.question.create({
				data: {
					quizId,
					type,
					text: data.text || "",
					media: data.media || null,
					timeLimitSec,
					points,
					order: nextOrder,
					variants: {
						create: defaultVariants.map((v, i) => ({
							text: v.text || "",
							media: v.media || null,
							isCorrect: Boolean(v.isCorrect),
							type: v.type || "TEXT",
							order: v.order !== undefined ? v.order : i,
						})),
					},
				},
				include: questionIncludeVariants,
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async findById(id) {
		try {
			return await PRISMA_CLIENT.question.findUniqueOrThrow({
				where: { id },
				include: {
					...questionIncludeVariants,
					quiz: {
						select: { authorId: true },
					},
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async update(id, data) {
		try {
			return await PRISMA_CLIENT.$transaction(async (tx) => {
				const updatePayload: Record<string, unknown> = {};

				if (data.text !== undefined) updatePayload.text = data.text;
				if (data.media !== undefined) updatePayload.media = data.media;
				if (data.type !== undefined) updatePayload.type = data.type;
				if (data.points !== undefined) updatePayload.points = data.points;
				if (data.timeLimitSec !== undefined) {
					updatePayload.timeLimitSec = data.timeLimitSec;
				}

				// If variants are provided in the payload, synchronize them atomically
				if (data.variants !== undefined) {
					const incomingIds = data.variants
						.map((v) => v.id)
						.filter((vId): vId is number => typeof vId === "number");

					// Delete variants that are no longer in incoming payload
					await tx.variant.deleteMany({
						where: {
							questionId: id,
							id: { notIn: incomingIds },
						},
					});

					// Update or create variants
					for (let i = 0; i < data.variants.length; i++) {
						const v = data.variants[i]!;
						const order = v.order !== undefined ? v.order : i;

						if (v.id) {
							const variantUpdateData: Record<string, unknown> = {
								isCorrect: Boolean(v.isCorrect),
								order,
							};
							if (v.text !== undefined) variantUpdateData.text = v.text;
							if (v.media !== undefined) variantUpdateData.media = v.media;
							if (v.type !== undefined) variantUpdateData.type = v.type;

							await tx.variant.update({
								where: { id: v.id },
								data: variantUpdateData,
							});
						} else {
							await tx.variant.create({
								data: {
									questionId: id,
									text: v.text || "",
									media: v.media || null,
									isCorrect: Boolean(v.isCorrect),
									type: v.type || "TEXT",
									order,
								},
							});
						}
					}
				}

				return tx.question.update({
					where: { id },
					data: updatePayload,
					include: questionIncludeVariants,
				});
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async reorder(quizId, questionIds) {
		try {
			return await PRISMA_CLIENT.$transaction(async (tx) => {
				for (let index = 0; index < questionIds.length; index++) {
					const id = questionIds[index]!;
					await tx.question.update({
						where: { id, quizId },
						data: { order: index },
					});
				}

				return tx.question.findMany({
					where: { quizId },
					orderBy: { order: "asc" },
					include: questionIncludeVariants,
				});
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async delete(id) {
		try {
			return await PRISMA_CLIENT.question.delete({
				where: { id },
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async duplicate(id) {
		try {
			return await PRISMA_CLIENT.$transaction(async (tx) => {
				const original = await tx.question.findUniqueOrThrow({
					where: { id },
					include: questionIncludeVariants,
				});

				// Shift subsequent questions order by +1
				await tx.question.updateMany({
					where: {
						quizId: original.quizId,
						order: { gt: original.order },
					},
					data: {
						order: { increment: 1 },
					},
				});

				// Create duplicated question
				return tx.question.create({
					data: {
						quizId: original.quizId,
						text: original.text,
						media: original.media,
						type: original.type,
						order: original.order + 1,
						points: original.points,
						timeLimitSec: original.timeLimitSec,
						variants: {
							create: original.variants.map((v) => ({
								text: v.text,
								media: v.media,
								isCorrect: v.isCorrect,
								type: v.type,
								order: v.order,
							})),
						},
					},
					include: questionIncludeVariants,
				});
			});
		} catch (e) {
			errorValidator(e);
		}
	},
};
