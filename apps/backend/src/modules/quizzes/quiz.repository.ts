import { PRISMA_CLIENT } from "../../config/database";
import { errorValidator } from "../../errors/errorValidator";
import type { Prisma } from "../../generated/prisma";
import type { QuizRepositoryContract } from "./types/quizzes.contracts";

const authorSelect = {
	select: {
		id: true,
		uuid: true,
		login: true,
		firstName: true,
		lastName: true,
	},
};

const fullQuizInclude = {
	keywords: true,
	questions: {
		orderBy: { order: "asc" as const },
		include: {
			variants: {
				orderBy: { order: "asc" as const },
			},
		},
	},
};

const publicFullQuizInclude = {
	author: authorSelect,
	keywords: true,
	questions: {
		orderBy: { order: "asc" as const },
		include: {
			variants: {
				orderBy: { order: "asc" as const },
			},
		},
	},
};

export const QuizRepository: QuizRepositoryContract = {
	async create({ authorId, name, description, coverImg, keywords }) {
		try {
			const createData: Prisma.QuizCreateInput = {
				author: { connect: { id: authorId } },
				name: name || "Новий квіз",
				description: description || null,
				coverImg: coverImg || null,
				isDraft: true,
			};

			if (keywords && keywords.length > 0) {
				createData.keywords = {
					create: keywords.map((k) => ({ name: k })),
				};
			}

			return await PRISMA_CLIENT.quiz.create({
				data: createData,
				include: fullQuizInclude,
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async findById(idOrUuid) {
		try {
			const isNumeric =
				typeof idOrUuid === "number" ||
				(!Number.isNaN(Number(idOrUuid)) &&
					!String(idOrUuid).includes("-"));

			const where = isNumeric
				? { id: Number(idOrUuid) }
				: { uuid: String(idOrUuid) };

			return await PRISMA_CLIENT.quiz.findUniqueOrThrow({
				where,
				include: fullQuizInclude,
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async findByUuid(uuid) {
		try {
			return await PRISMA_CLIENT.quiz.findUniqueOrThrow({
				where: { uuid },
				include: publicFullQuizInclude,
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async findPublishedQuizzes({ search, skip, take, sortBy, sortOrder }) {
		try {
			const whereClause: Record<string, unknown> = {
				isDraft: false,
			};

			if (search) {
				whereClause.OR = [
					{ name: { contains: search, mode: "insensitive" } },
					{ description: { contains: search, mode: "insensitive" } },
					{
						keywords: {
							some: {
								name: { contains: search, mode: "insensitive" },
							},
						},
					},
				];
			}

			const orderByKey = sortBy === "name" ? "name" : "createdAt";
			const orderDirection = sortOrder === "asc" ? "asc" : "desc";

			return await PRISMA_CLIENT.quiz.findMany({
				where: whereClause,
				skip,
				take,
				orderBy: { [orderByKey]: orderDirection },
				include: {
					author: authorSelect,
					keywords: true,
					_count: {
						select: { questions: true },
					},
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async countPublishedQuizzes({ search }) {
		try {
			const whereClause: Record<string, unknown> = {
				isDraft: false,
			};

			if (search) {
				whereClause.OR = [
					{ name: { contains: search, mode: "insensitive" } },
					{ description: { contains: search, mode: "insensitive" } },
					{
						keywords: {
							some: {
								name: { contains: search, mode: "insensitive" },
							},
						},
					},
				];
			}

			return await PRISMA_CLIENT.quiz.count({
				where: whereClause,
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async findUserQuizzes({ authorId, isDraft, search, skip, take }) {
		try {
			const whereClause: Record<string, unknown> = { authorId };

			if (isDraft !== undefined) {
				whereClause.isDraft = isDraft;
			}

			if (search) {
				whereClause.OR = [
					{ name: { contains: search, mode: "insensitive" } },
					{ description: { contains: search, mode: "insensitive" } },
					{
						keywords: {
							some: {
								name: { contains: search, mode: "insensitive" },
							},
						},
					},
				];
			}

			return await PRISMA_CLIENT.quiz.findMany({
				where: whereClause,
				skip,
				take,
				orderBy: { updatedAt: "desc" },
				include: {
					keywords: true,
					_count: {
						select: { questions: true },
					},
				},
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async countUserQuizzes({ authorId, isDraft, search }) {
		try {
			const whereClause: Record<string, unknown> = { authorId };

			if (isDraft !== undefined) {
				whereClause.isDraft = isDraft;
			}

			if (search) {
				whereClause.OR = [
					{ name: { contains: search, mode: "insensitive" } },
					{ description: { contains: search, mode: "insensitive" } },
					{
						keywords: {
							some: {
								name: { contains: search, mode: "insensitive" },
							},
						},
					},
				];
			}

			return await PRISMA_CLIENT.quiz.count({
				where: whereClause,
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async update(id, data) {
		try {
			return await PRISMA_CLIENT.$transaction(async (tx) => {
				if (data.keywords) {
					// Remove existing keywords and insert new ones
					await tx.keyword.deleteMany({ where: { quizId: id } });
					if (data.keywords.length > 0) {
						await tx.keyword.createMany({
							data: data.keywords.map((name) => ({
								name,
								quizId: id,
							})),
						});
					}
				}

				const dataToUpdate: Record<string, unknown> = {};
				if (data.name !== undefined) dataToUpdate.name = data.name;
				if (data.description !== undefined)
					dataToUpdate.description = data.description;
				if (data.coverImg !== undefined)
					dataToUpdate.coverImg = data.coverImg;

				return tx.quiz.update({
					where: { id },
					data: dataToUpdate,
					include: fullQuizInclude,
				});
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async publish(id) {
		try {
			return await PRISMA_CLIENT.quiz.update({
				where: { id },
				data: { isDraft: false },
				include: fullQuizInclude,
			});
		} catch (e) {
			errorValidator(e);
		}
	},

	async delete(id) {
		try {
			return await PRISMA_CLIENT.quiz.delete({
				where: { id },
			});
		} catch (e) {
			errorValidator(e);
		}
	},
};
