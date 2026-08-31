import { NotFoundError } from "../../errors/customErrors";
import { ReportsRepository } from "./reports.repository";
import type { ReportsServiceContract } from "./types/reports.contracts";
import type {
	TeacherSessionsListDto,
	TeacherSessionReportDto,
	StudentResultReportDto,
	TeacherSessionSummaryDto,
	SessionParticipantSummaryDto,
	SessionQuestionStatsDto,
	QuestionReportDto,
} from "@viaquiz/shared-types";

export const ReportsService: ReportsServiceContract = {
	async getTeacherSessions(hostId: number, page: number, pageSize: number, search?: string): Promise<TeacherSessionsListDto> {
		const { rooms, total } = await ReportsRepository.findFinishedSessionsByHost(hostId, page, pageSize, search);

		const sessions: TeacherSessionSummaryDto[] = rooms.map((room: any) => {
			let totalScore = 0;
			let totalPercentage = 0;
			let validParticipants = 0;

			for (const participant of room.participants) {
				if (participant.result && participant.result.totalQuestionsCount > 0) {
					const ratio = participant.result.correctAnswersCount / participant.result.totalQuestionsCount;
					totalScore += ratio * 12;
					totalPercentage += ratio * 100;
					validParticipants++;
				}
			}

			return {
				roomId: room.id,
				roomUuid: room.uuid,
				quizName: room.quiz.name,
				quizUuid: room.quiz.uuid,
				courseName: room.course?.name || null,
				groupName: room.course?.classroom?.name || null,
				status: room.status as "AWAITING" | "PROGRESS" | "REVIEWING" | "FINISHED",
				participantsCount: room._count.participants,
				avgScore: validParticipants > 0 ? Math.round(totalScore / validParticipants) : 0,
				avgPercentage: validParticipants > 0 ? Math.round(totalPercentage / validParticipants) : 0,
				startedAt: room.startedAt ? room.startedAt.toISOString() : null,
				endedAt: room.endedAt ? room.endedAt.toISOString() : null,
				createdAt: room.createdAt.toISOString(),
			};
		});

		return {
			sessions,
			total,
			page,
			pageSize,
		};
	},

	async getSessionReport(roomUuid: string, hostId: number): Promise<TeacherSessionReportDto> {
		const room: any = await ReportsRepository.findSessionReportData(roomUuid, hostId);

		if (!room) {
			throw new NotFoundError("Сесію не знайдено або у вас немає до неї доступу");
		}

		const totalQuestions = room.quiz.questions.length;
		const totalParticipants = room.participants.length;

		const participants: SessionParticipantSummaryDto[] = room.participants.map((p: any) => {
			let correctCount = 0;
			let incorrectCount = 0;
			let skippedCount = 0;
			let totalTimeSpentMs = 0;

			const questionStatuses: Array<"CORRECT" | "INCORRECT" | "SKIPPED"> = room.quiz.questions.map((q: any) => {
				const answer = p.answers.find((a: any) => a.questionId === q.id);

				if (!answer || answer.isSkipped) {
					skippedCount++;
					return "SKIPPED";
				}

				totalTimeSpentMs += answer.timeSpentMs;

				if (answer.isCorrect) {
					correctCount++;
					return "CORRECT";
				} else {
					incorrectCount++;
					return "INCORRECT";
				}
			});

			const studentName = p.student
				? `${p.student.lastName || ""} ${p.student.firstName || ""}`.trim()
				: null;
			const ratio = totalQuestions > 0 ? correctCount / totalQuestions : 0;

			return {
				participantId: p.id,
				participantUuid: p.uuid,
				nickname: p.nickname,
				studentName,
				score: p.score,
				grade: Math.min(12, Math.max(0, Math.round(ratio * 12))),
				percentage: Math.round(ratio * 100),
				correctCount,
				incorrectCount,
				skippedCount,
				totalTimeSpentSec: Math.round(totalTimeSpentMs / 100) / 10,
				questionStatuses,
			};
		});

		participants.sort((a, b) => b.percentage - a.percentage);

		let roomAvgGrade = 0;
		let roomAvgPercentage = 0;

		if (participants.length > 0) {
			roomAvgGrade = Math.round(participants.reduce((acc, p) => acc + p.grade, 0) / participants.length);
			roomAvgPercentage = Math.round(participants.reduce((acc, p) => acc + p.percentage, 0) / participants.length);
		}

		const questionStats: SessionQuestionStatsDto[] = room.quiz.questions.map((q: any, index: number) => {
			let correct = 0;
			let incorrect = 0;
			let skipped = 0;
			let totalTimeMs = 0;
			let answeredCount = 0;

			room.participants.forEach((p: any) => {
				const answer = p.answers.find((a: any) => a.questionId === q.id);
				if (!answer || answer.isSkipped) {
					skipped++;
				} else {
					if (answer.isCorrect) correct++;
					else incorrect++;

					totalTimeMs += answer.timeSpentMs;
					answeredCount++;
				}
			});

			return {
				questionId: q.id,
				questionNumber: index + 1,
				text: q.text,
				type: q.type,
				correctCount: correct,
				incorrectCount: incorrect,
				skippedCount: skipped,
				totalParticipants: room.participants.length,
				correctPercentage: room.participants.length > 0 ? Math.round((correct / room.participants.length) * 100) : 0,
				avgTimeSpentSec: answeredCount > 0 ? Math.round((totalTimeMs / answeredCount) / 100) / 10 : 0,
			};
		});

		return {
			roomId: room.id,
			roomUuid: room.uuid,
			quizName: room.quiz.name,
			quizUuid: room.quiz.uuid,
			courseName: room.course?.name || null,
			groupName: room.course?.classroom?.name || null,
			totalQuestions,
			totalParticipants,
			avgGrade: roomAvgGrade,
			avgPercentage: roomAvgPercentage,
			startedAt: room.startedAt ? room.startedAt.toISOString() : null,
			endedAt: room.endedAt ? room.endedAt.toISOString() : null,
			participants,
			questionStats,
		};
	},

	async getParticipantReport(roomUuid: string, participantId: number, hostId: number): Promise<StudentResultReportDto> {
		const room: any = await ReportsRepository.findParticipantReportData(roomUuid, participantId, hostId);

		if (!room) {
			throw new NotFoundError("Сесію не знайдено або у вас немає до неї доступу");
		}

		if (room.participants.length === 0) {
			throw new NotFoundError("Учасника не знайдено в цій сесії");
		}

		const participant = room.participants[0];
		const student = participant.student;
		const quiz = room.quiz;
		const author = quiz.author;
		const host = room.host;

		const authorName = author
			? `${author.lastName || ""} ${author.firstName || ""}`.trim() || "NickName"
			: "NickName";
		const teacherName = host
			? `${host.lastName || ""} ${host.firstName || ""}`.trim() || "NickName"
			: "NickName";
		const participantName = student
			? `${student.lastName || ""} ${student.firstName || ""}`.trim()
			: null;

		const questions = quiz.questions || [];
		const answers = participant.answers || [];

		let correctCount = 0;
		let incorrectCount = 0;
		let skippedCount = 0;
		let totalTimeSpentMs = 0;

		const questionReports: QuestionReportDto[] = questions.map((q: any, index: number) => {
			const answer = answers.find((a: any) => a.questionId === q.id);

			const isSkipped = !answer || answer.isSkipped;
			const isCorrect = !isSkipped && !!answer.isCorrect;
			const timeSpentMs = answer ? answer.timeSpentMs || 0 : 0;
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
			if (!isSkipped && answer) {
				if (
					answer.typedAnswer !== null &&
					answer.typedAnswer !== undefined &&
					answer.typedAnswer.trim() !== ""
				) {
					studentAnswer = answer.typedAnswer;
				} else if (answer.variants && answer.variants.length > 0) {
					studentAnswer = answer.variants
						.map((av: any) => av.variant?.text || "—")
						.join(", ");
				}
			}

			const correctVariants = (q.variants || []).filter((v: any) => v.isCorrect);
			const correctAnswer =
				correctVariants.length > 0
					? correctVariants
							.map((v: any) => v.text || "—")
							.join(q.type === "TYPE_ANSWER_V1" ? " / " : ", ")
					: "—";

			const points = q.points || 1000;
			const earnedPoints = isCorrect ? (answer?.scoreEarned || points) : 0;
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

		const totalQuestionsCount = questions.length || 1;
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
			resultUuid: participant.result?.uuid || participant.uuid,
			score: participant.score,
			correctAnswersCount: correctCount,
			incorrectAnswersCount: incorrectCount,
			skippedAnswersCount: skippedCount,
			totalQuestionsCount,
			totalTimeSpentSec,
			grade,
			percentage,
			createdAt: participant.joinedAt?.toISOString() || new Date().toISOString(),
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
