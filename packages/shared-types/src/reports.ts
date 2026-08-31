// Session summary for teacher's sessions list
export interface TeacherSessionSummaryDto {
	roomId: number;
	roomUuid: string;
	quizName: string;
	quizUuid: string;
	courseName: string | null;
	groupName?: string | null;
	status: 'AWAITING' | 'PROGRESS' | 'REVIEWING' | 'FINISHED';
	participantsCount: number;
	avgScore: number;
	avgPercentage: number;
	startedAt: string | null;
	endedAt: string | null;
	createdAt: string;
}

export interface TeacherSessionsListDto {
	sessions: TeacherSessionSummaryDto[];
	total: number;
	page: number;
	pageSize: number;
}

export interface SessionParticipantSummaryDto {
	participantId: number;
	participantUuid: string;
	nickname: string;
	studentName: string | null;
	score: number;
	grade: number;
	percentage: number;
	correctCount: number;
	incorrectCount: number;
	skippedCount: number;
	totalTimeSpentSec: number;
	questionStatuses: Array<'CORRECT' | 'INCORRECT' | 'SKIPPED'>;
}

export interface SessionQuestionStatsDto {
	questionId: number;
	questionNumber: number;
	text: string;
	type: string;
	correctCount: number;
	incorrectCount: number;
	skippedCount: number;
	totalParticipants: number;
	correctPercentage: number;
	avgTimeSpentSec: number;
}

export interface TeacherSessionReportDto {
	roomId: number;
	roomUuid: string;
	quizName: string;
	quizUuid: string;
	courseName: string | null;
	groupName?: string | null;
	totalQuestions: number;
	totalParticipants: number;
	avgGrade: number;
	avgPercentage: number;
	startedAt: string | null;
	endedAt: string | null;
	participants: SessionParticipantSummaryDto[];
	questionStats: SessionQuestionStatsDto[];
}
