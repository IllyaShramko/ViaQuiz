import { PRISMA_CLIENT } from "../../config/database";
import type {
	Room,
	Participant,
	Answer,
	Result,
	Student,
} from "../../generated/prisma";
import type {
	GameSessionsRepositoryContract,
	FullQuizSession,
} from "./types/game-sessions.contracts";
import type { CreateRoomDto, RoomStatus } from "./types/game-sessions.types";

export const GameSessionsRepository: GameSessionsRepositoryContract = {
	async createRoom(
		hostId: number,
		data: CreateRoomDto,
		joinCode: string,
	): Promise<Room> {
		return PRISMA_CLIENT.room.create({
			data: {
				hostId,
				quizId: data.quizId,
				courseId: data.courseId ?? null,
				joinCode,
				status: "AWAITING",
				currentQuestionIndex: 0,
			},
		});
	},

	async findRoomById(id: number): Promise<Room | null> {
		return PRISMA_CLIENT.room.findUnique({
			where: { id },
			include: {
				quiz: true,
				course: true,
				participants: true,
			},
		});
	},

	async findRoomByUuid(uuid: string): Promise<Room | null> {
		return PRISMA_CLIENT.room.findUnique({
			where: { uuid },
			include: {
				quiz: true,
				course: true,
				participants: true,
			},
		});
	},

	async findRoomByJoinCode(joinCode: string): Promise<Room | null> {
		return PRISMA_CLIENT.room.findUnique({
			where: { joinCode },
			include: {
				quiz: true,
				course: true,
				participants: true,
			},
		});
	},

	async updateRoomStatus(
		id: number,
		status: RoomStatus,
		currentQuestionIndex?: number,
	): Promise<Room> {
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

	async findQuizWithQuestions(quizId: number): Promise<FullQuizSession | null> {
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

	async findStudentById(studentId: number): Promise<Student | null> {
		return PRISMA_CLIENT.student.findUnique({
			where: { id: studentId },
		});
	},

	async isStudentEnrolledInCourse(
		studentId: number,
		courseId: number,
	): Promise<boolean> {
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

	async createParticipant(data: {
		roomId: number;
		nickname: string;
		studentId?: number | null;
	}): Promise<Participant> {
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

	async findParticipantById(id: number): Promise<Participant | null> {
		return PRISMA_CLIENT.participant.findUnique({
			where: { id },
			include: {
				room: true,
				student: true,
			},
		});
	},

	async findParticipantByRoomAndStudent(
		roomId: number,
		studentId: number,
	): Promise<Participant | null> {
		return PRISMA_CLIENT.participant.findUnique({
			where: {
				roomId_studentId: {
					roomId,
					studentId,
				},
			},
		});
	},

	async findParticipantsByRoomId(roomId: number): Promise<Participant[]> {
		return PRISMA_CLIENT.participant.findMany({
			where: { roomId, isBanned: false },
			orderBy: { score: "desc" },
		});
	},

	async updateParticipantConnection(
		participantId: number,
		isConnected: boolean,
	): Promise<Participant> {
		return PRISMA_CLIENT.participant.update({
			where: { id: participantId },
			data: { isConnected },
		});
	},

	async banParticipant(participantId: number): Promise<Participant> {
		return PRISMA_CLIENT.participant.update({
			where: { id: participantId },
			data: {
				isBanned: true,
				isConnected: false,
			},
		});
	},

	async deleteParticipant(participantId: number): Promise<Participant> {
		return PRISMA_CLIENT.participant.delete({
			where: { id: participantId },
		});
	},

	async saveAnswer(data: {
		participantId: number;
		questionId?: number | null | undefined;
		variantId?: number | null | undefined;
		timeSpentMs: number;
		isCorrect: boolean;
		isSkipped?: boolean | undefined;
	}): Promise<Answer> {
		return PRISMA_CLIENT.answer.create({
			data: {
				participantId: data.participantId,
				questionId: data.questionId ?? null,
				variantId: data.variantId ?? null,
				timeSpentMs: data.timeSpentMs,
				isCorrect: data.isCorrect,
				isSkipped: data.isSkipped ?? false,
			},
		});
	},

	async saveResult(data: {
		roomId: number;
		participantId: number;
		score: number;
		correctAnswersCount: number;
		totalQuestionsCount: number;
	}): Promise<Result> {
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

	async findResultByUuid(uuid: string): Promise<any | null> {
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
								variant: true,
							},
						},
					},
				},
			},
		});
	},
};
