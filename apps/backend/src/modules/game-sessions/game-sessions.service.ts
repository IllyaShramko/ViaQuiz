import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import {
	BadRequestError,
	NotFoundError,
	ForbiddenError,
} from "../../errors/customErrors";
import { GameSessionsRepository } from "./game-sessions.repository";
import { gameRedisService } from "./game-redis.service";
import type { Room, Participant } from "../../generated/prisma";
import type {
	GameSessionsServiceContract,
	FullQuizSession,
} from "./types/game-sessions.contracts";
import type {
	CreateRoomDto,
	JoinByCodeDto,
	GameJwtPayload,
	QuestionReportDto,
	StudentResultReportDto,
} from "./types/game-sessions.types";

export const GameSessionsService: GameSessionsServiceContract = {
	async createRoom(hostId: number, data: CreateRoomDto): Promise<Room> {
		const quiz = await GameSessionsRepository.findQuizWithQuestions(data.quizId);
		if (!quiz) {
			throw new NotFoundError("Quiz not found");
		}

		if (!quiz.questions || quiz.questions.length === 0) {
			throw new BadRequestError("This quiz has no questions");
		}

		// Generate random 6-digit PIN code
		let joinCode = "";
		let isUnique = false;
		let attempts = 0;

		while (!isUnique && attempts < 10) {
			attempts++;
			joinCode = Math.floor(100000 + Math.random() * 900000).toString();
			const existing = await GameSessionsRepository.findRoomByJoinCode(joinCode);
			if (!existing) {
				isUnique = true;
			}
		}

		if (!isUnique) {
			throw new BadRequestError("Failed to generate a unique room code. Try again.");
		}

		const room = await GameSessionsRepository.createRoom(
			hostId,
			data,
			joinCode,
		);

		// Cache in Redis
		await gameRedisService.setRoomState(room.id, {
			roomId: room.id,
			roomUuid: room.uuid,
			status: "AWAITING",
			currentQuestionIndex: 0,
			totalQuestions: quiz.questions.length,
		});

		return room;
	},

	async validateJoinCode(joinCode: string): Promise<Room> {
		const room = await GameSessionsRepository.findRoomByJoinCode(joinCode);
		if (!room) {
			throw new NotFoundError("Room with this PIN code was not found");
		}

		if (room.status === "FINISHED") {
			throw new BadRequestError("This game session has already finished");
		}

		return room;
	},

	async joinRoom(
		data: JoinByCodeDto,
		currentUserId?: number,
	): Promise<{
		participant: Participant;
		token: string;
		room: Room;
	}> {
		const room = await this.validateJoinCode(data.joinCode);

		let nickname = data.nickname?.trim() || "Participant";
		let studentId: number | null = null;
		let role: "STUDENT" | "ANONYMOUS" = "ANONYMOUS";

		const student = currentUserId
			? await GameSessionsRepository.findStudentById(currentUserId)
			: null;

		// Якщо кімната закріплена за курсом/класом
		if (room.courseId) {
			if (!student) {
				throw new ForbiddenError(
					"Цей тест тільки для учнів курсу. Будь ласка, увійдіть під учнівським акаунтом.",
				);
			}

			const isEnrolled = await GameSessionsRepository.isStudentEnrolledInCourse(
				student.id,
				room.courseId,
			);

			if (!isEnrolled) {
				throw new ForbiddenError(
					"Ви не зараховані до цього курсу/класу. Доступ заборонено.",
				);
			}
		}

		if (student) {
			nickname = `${student.lastName} ${student.firstName}`.trim();
			studentId = student.id;
			role = "STUDENT";

			// Перевіряємо, чи студент уже приєднувався до цієї кімнати раніше
			const existingParticipant =
				await GameSessionsRepository.findParticipantByRoomAndStudent(
					room.id,
					studentId,
				);

			if (existingParticipant) {
				if (existingParticipant.isBanned) {
					throw new ForbiddenError("Вас було вилучено з цієї вікторини.");
				}

				await GameSessionsRepository.updateParticipantConnection(
					existingParticipant.id,
					true,
				);

				const token = this.generateGameToken({
					participantId: existingParticipant.id,
					participantUuid: existingParticipant.uuid,
					roomId: room.id,
					roomUuid: room.uuid,
					role,
					studentId: existingParticipant.studentId,
					nickname: existingParticipant.nickname,
				});

				return { participant: existingParticipant, token, room };
			}
		}

		const participant = await GameSessionsRepository.createParticipant({
			roomId: room.id,
			nickname,
			studentId,
		});

		// Cache in Redis
		await gameRedisService.addParticipant(room.id, {
			participantId: participant.id,
			participantUuid: participant.uuid,
			nickname: participant.nickname,
			studentId: participant.studentId,
			isConnected: true,
			score: 0,
		});

		const token = this.generateGameToken({
			participantId: participant.id,
			participantUuid: participant.uuid,
			roomId: room.id,
			roomUuid: room.uuid,
			role,
			studentId: participant.studentId,
			nickname: participant.nickname,
		});

		return { participant, token, room };
	},

	async getRoomByUuid(uuid: string, currentUserId?: number): Promise<Room> {
		const room = await GameSessionsRepository.findRoomByUuid(uuid);
		if (!room) {
			throw new NotFoundError("Game room not found");
		}

		return room;
	},

	async getQuizSessionData(quizId: number): Promise<FullQuizSession> {
		const quiz = await GameSessionsRepository.findQuizWithQuestions(quizId);
		if (!quiz) {
			throw new NotFoundError("Quiz not found");
		}
		return quiz;
	},

	generateGameToken(payload: GameJwtPayload): string {
		return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "12h" });
	},

	verifyGameToken(token: string): GameJwtPayload {
		try {
			return jwt.verify(token, env.JWT_SECRET) as GameJwtPayload;
		} catch (error) {
			throw new ForbiddenError("Invalid or expired game token");
		}
	},

	async getResultReport(uuid: string): Promise<StudentResultReportDto> {
		const result = await GameSessionsRepository.findResultByUuid(uuid);
		if (!result) {
			throw new NotFoundError("Результат тесту не знайдено");
		}

		const quiz = result.room.quiz;
		const author = quiz.author;
		const host = result.room.host;
		const participant = result.participant;
		const student = participant.student;

		const authorName = author
			? `${author.lastName || ""} ${author.firstName || ""}`.trim() || "Шрамко Ілля"
			: "Шрамко Ілля";
		const teacherName = host
			? `${host.lastName || ""} ${host.firstName || ""}`.trim() || "Шрамко Ілля"
			: "Шрамко Ілля";

		const participantName = student
			? `${student.lastName || ""} ${student.firstName || ""}`.trim()
			: participant.nickname;

		const questions = quiz.questions || [];
		const answers = participant.answers || [];

		let correctCount = 0;
		let incorrectCount = 0;
		let skippedCount = 0;
		let totalTimeSpentMs = 0;

		const questionReports: QuestionReportDto[] = questions.map((q: any, index: number) => {
			const qAnswers = answers.filter(
				(a: any) =>
					a.questionId === q.id ||
					(a.variantId && q.variants.some((v: any) => v.id === a.variantId)),
			);

			const isSkipped =
				qAnswers.length === 0 || qAnswers.some((a: any) => a.isSkipped);
			const isCorrect = !isSkipped && qAnswers.some((a: any) => a.isCorrect);

			let timeSpentMs = 0;
			if (qAnswers.length > 0) {
				timeSpentMs = qAnswers[0].timeSpentMs || 0;
			}
			totalTimeSpentMs += timeSpentMs;

			let status: "CORRECT" | "INCORRECT" | "SKIPPED" = "SKIPPED";
			if (isSkipped) {
				status = "SKIPPED";
				skippedCount++;
			} else if (isCorrect) {
				status = "CORRECT";
				correctCount++;
			} else {
				status = "INCORRECT";
				incorrectCount++;
			}

			let studentAnswer = "Пропущено";
			if (!isSkipped && qAnswers.length > 0) {
				const chosenVariants = q.variants.filter((v: any) =>
					qAnswers.some((a: any) => a.variantId === v.id),
				);
				if (chosenVariants.length > 0) {
					studentAnswer = chosenVariants
						.map((v: any) => v.text || "—")
						.join(", ");
				}
			}

			const correctVariants = q.variants.filter((v: any) => v.isCorrect);
			const correctAnswer =
				correctVariants.length > 0
					? correctVariants.map((v: any) => v.text || "—").join(", ")
					: "—";

			const points = q.points || 1;
			const earnedPoints = isCorrect ? points : 0;
			const timeSpentSec = Number((timeSpentMs / 1000).toFixed(2));

			return {
				questionId: q.id,
				questionNumber: index + 1,
				text: q.text,
				media: q.media || null,
				type: q.type,
				points,
				earnedPoints,
				timeSpentSec,
				status,
				studentAnswer,
				correctAnswer,
				isCorrect,
				isSkipped,
			};
		});

		const totalQuestionsCount = questions.length || result.totalQuestionsCount || 1;
		const totalTimeSpentSec = Number((totalTimeSpentMs / 1000).toFixed(1));
		const grade = Math.min(
			12,
			Math.max(0, Math.round((correctCount / totalQuestionsCount) * 12)),
		);
		const percentage = Math.min(
			100,
			Math.max(0, Math.round((correctCount / totalQuestionsCount) * 100)),
		);

		return {
			resultUuid: result.uuid,
			score: result.score,
			correctAnswersCount: correctCount,
			incorrectAnswersCount: incorrectCount,
			skippedAnswersCount: skippedCount,
			totalQuestionsCount,
			totalTimeSpentSec,
			grade,
			percentage,
			createdAt: result.createdAt.toISOString(),
			quiz: {
				id: quiz.id,
				uuid: quiz.uuid,
				name: quiz.name,
				authorName,
				teacherName,
			},
			participant: {
				id: participant.id,
				uuid: participant.uuid,
				nickname: participant.nickname,
				studentName: participantName,
			},
			questions: questionReports,
		};
	},
};
