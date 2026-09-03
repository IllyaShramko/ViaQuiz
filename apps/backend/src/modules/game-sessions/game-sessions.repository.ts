import { PRISMA_CLIENT } from "../../config/database";
import type {
	GameSessionsRepositoryContract,
	FullQuizSession,
} from "./types/game-sessions.contracts";

export const GameSessionsRepository: GameSessionsRepositoryContract = {
	async createRoom(hostId, data, joinCode) {
		return PRISMA_CLIENT.room.create({
			data: {
				hostId,
				quizId: data.quizId,
				classroomId: data.classroomId ?? null,
				courseId: data.courseId ?? null,
				joinCode,
				status: "AWAITING",
				currentQuestionIndex: 0,
			},
		});
	},

	async findRoomById(id) {
		return PRISMA_CLIENT.room.findUnique({
			where: { id },
			include: {
				quiz: true,
				classroom: true,
				course: true,
				participants: true,
			},
		});
	},

	async findRoomByUuid(uuid) {
		return PRISMA_CLIENT.room.findUnique({
			where: { uuid },
			include: {
				quiz: true,
				classroom: true,
				course: true,
				participants: true,
			},
		});
	},

	async findRoomByJoinCode(joinCode) {
		return PRISMA_CLIENT.room.findUnique({
			where: { joinCode },
			include: {
				quiz: true,
				classroom: true,
				course: true,
				participants: true,
			},
		});
	},

	async updateRoomStatus(id, status, currentQuestionIndex) {
		return PRISMA_CLIENT.room.update({
			where: { id },
			data: {
				status,
				...(currentQuestionIndex !== undefined ? { currentQuestionIndex } : {}),
				...(status === "PROGRESS" ? { startedAt: new Date() } : {}),
				...(status === "FINISHED" ? { endedAt: new Date() } : {}),
			},
		});
	},

	async findQuizWithQuestions(quizId) {
		return PRISMA_CLIENT.quiz.findUnique({
			where: { id: quizId },
			include: {
				questions: {
					orderBy: { order: "asc" },
					include: {
						variants: {
							orderBy: { order: "asc" },
						},
					},
				},
			},
		}) as Promise<FullQuizSession | null>;
	},

	async findStudentById(studentId) {
		return PRISMA_CLIENT.student.findUnique({
			where: { id: studentId },
		});
	},

	async findUserById(userId) {
		return PRISMA_CLIENT.user.findUnique({
			where: { id: userId },
		});
	},

	async findCourseById(id) {
		return PRISMA_CLIENT.course.findUnique({
			where: { id },
			include: {
				classroom: true,
			},
		});
	},

	async isStudentEnrolledInCourse(studentId, courseId) {
		const course = await PRISMA_CLIENT.course.findFirst({
			where: {
				id: courseId,
				students: {
					some: { id: studentId },
				},
			},
		});
		return !!course;
	},

	async createParticipant(data) {
		return PRISMA_CLIENT.participant.create({
			data: {
				roomId: data.roomId,
				nickname: data.nickname,
				studentId: data.studentId ?? null,
				score: 0,
				isConnected: true,
				isBanned: false,
			},
		});
	},

	async findParticipantById(id) {
		return PRISMA_CLIENT.participant.findUnique({
			where: { id },
			include: {
				room: true,
				student: true,
			},
		});
	},

	async findParticipantByRoomAndStudent(roomId, studentId) {
		return PRISMA_CLIENT.participant.findUnique({
			where: {
				roomId_studentId: {
					roomId,
					studentId,
				},
			},
		});
	},

	async findParticipantsByRoomId(roomId) {
		return PRISMA_CLIENT.participant.findMany({
			where: { roomId, isBanned: false },
			orderBy: { score: "desc" },
		});
	},

	async updateParticipantConnection(participantId, isConnected) {
		return PRISMA_CLIENT.participant.update({
			where: { id: participantId },
			data: { isConnected },
		});
	},

	async banParticipant(participantId) {
		return PRISMA_CLIENT.participant.update({
			where: { id: participantId },
			data: {
				isBanned: true,
				isConnected: false,
			},
		});
	},

	async deleteParticipant(participantId) {
		return PRISMA_CLIENT.participant.delete({
			where: { id: participantId },
		});
	},

	async saveAnswer(data) {
		return PRISMA_CLIENT.answer.upsert({
			where: {
				participantId_questionId: {
					participantId: data.participantId,
					questionId: data.questionId,
				},
			},
			create: {
				participantId: data.participantId,
				questionId: data.questionId,
				typedAnswer: data.typedAnswer ?? null,
				timeSpentMs: data.timeSpentMs,
				scoreEarned: data.scoreEarned ?? 0,
				isCorrect: data.isCorrect,
				isSkipped: data.isSkipped ?? false,
				...(data.variantIds && data.variantIds.length > 0
					? {
							variants: {
								create: data.variantIds.map((vId) => ({
									variantId: vId,
								})),
							},
					  }
					: {}),
			},
			update: {
				typedAnswer: data.typedAnswer ?? null,
				timeSpentMs: data.timeSpentMs,
				scoreEarned: data.scoreEarned ?? 0,
				isCorrect: data.isCorrect,
				isSkipped: data.isSkipped ?? false,
				variants: {
					deleteMany: {},
					...(data.variantIds && data.variantIds.length > 0
						? {
								create: data.variantIds.map((vId) => ({
									variantId: vId,
								})),
						  }
						: {}),
				},
			},
		});
	},

	async saveResult(data) {
		return PRISMA_CLIENT.result.upsert({
			where: { participantId: data.participantId },
			create: {
				roomId: data.roomId,
				participantId: data.participantId,
				score: data.score,
				correctAnswersCount: data.correctAnswersCount,
				totalQuestionsCount: data.totalQuestionsCount,
			},
			update: {
				score: data.score,
				correctAnswersCount: data.correctAnswersCount,
				totalQuestionsCount: data.totalQuestionsCount,
			},
		});
	},

	async findResultByUuid(uuid) {
		return PRISMA_CLIENT.result.findUnique({
			where: { uuid },
			include: {
				room: {
					include: {
						quiz: {
							include: {
								author: {
									select: {
										id: true,
										firstName: true,
										lastName: true,
									},
								},
								questions: {
									orderBy: { order: "asc" },
									include: {
										variants: {
											orderBy: { order: "asc" },
										},
									},
								},
							},
						},
						host: {
							select: {
								id: true,
								firstName: true,
								lastName: true,
							},
						},
						course: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
				participant: {
					include: {
						student: {
							select: {
								id: true,
								firstName: true,
								lastName: true,
							},
						},
						answers: {
							include: {
								variants: {
									include: {
										variant: true,
									},
								},
							},
						},
					},
				},
			},
		});
	},
};
