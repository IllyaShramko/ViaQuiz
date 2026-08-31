export type RoomStatus = "AWAITING" | "PROGRESS" | "REVIEWING" | "FINISHED";

export interface CreateRoomDto {
	quizId: number;
	courseId?: number | null | undefined;
}

export interface JoinByCodeDto {
	joinCode: string;
	nickname?: string | undefined;
}

export interface GameJwtPayload {
	participantId: number;
	participantUuid: string;
	roomId: number;
	roomUuid: string;
	role: "STUDENT" | "ANONYMOUS";
	studentId?: number | null | undefined;
	nickname: string;
}

export interface SubmitAnswerDto {
	roomId: number;
	questionIndex: number;
	variantIds?: number[] | undefined;
	typedAnswer?: string | undefined;
}

export interface ParticipantDto {
	participantId: number;
	participantUuid: string;
	nickname: string;
	studentId?: number | null | undefined;
	isConnected: boolean;
	isBanned?: boolean | undefined;
	score: number;
}

export interface QuestionVariantDto {
	id: number;
	text?: string | null | undefined;
	media?: string | null | undefined;
	order: number;
}

export interface GameQuestionDto {
	questionIndex: number;
	totalQuestions: number;
	text: string;
	media?: string | null | undefined;
	type: "ONE_ANSWER" | "MANY_ANSWERS" | "TYPE_ANSWER_V1" | "TYPE_ANSWER_V2" | string;
	points: number;
	timeLimit: number;
	startedAt: number;
	variants: QuestionVariantDto[];
}

export interface ParticipantRoundResultDto {
	isAnswered: boolean;
	isCorrect: boolean;
	pointsEarned: number;
	timeSpentMs: number;
	selectedVariantIds?: number[] | undefined;
	typedAnswer?: string | undefined;
}

export interface ParticipantRoundAnswerDto {
	participantId: number;
	nickname: string;
	isAnswered: boolean;
	variantIds?: number[] | undefined;
	typedAnswer?: string | undefined;
	timeSpentMs: number;
	isCorrect: boolean;
	scoreEarned: number;
	totalScore?: number | undefined;
}

export interface GameReviewDataDto {
	questionIndex: number;
	correctVariantIds: number[];
	correctTextAnswers?: string[] | undefined;
	answersDistribution: Record<number, number>;
	totalAnswered?: number | undefined;
	totalParticipants?: number | undefined;
	participantAnswers?: ParticipantRoundAnswerDto[] | undefined;
	participantResult?: ParticipantRoundResultDto | undefined;
	myAnswer?: {
		variantIds?: number[] | undefined;
		typedAnswer?: string | undefined;
		timeSpentMs: number;
		isCorrect?: boolean | undefined;
		scoreEarned?: number | undefined;
	} | null | undefined;
}

export interface GameSyncStateDto {
	roomState: {
		roomId: number;
		roomUuid: string;
		status: RoomStatus;
		currentQuestionIndex: number;
		questionStartedAt?: number | undefined;
		timeLimitMs?: number | undefined;
		totalQuestions?: number | undefined;
	} | null;
	participants: ParticipantDto[];
	currentParticipantId?: number | undefined;
	currentQuestion?: GameQuestionDto | null;
	alreadyAnswered: boolean;
	reviewData?: GameReviewDataDto | null;
	finishedData?: GameFinishedDto | null;
	answeredCount?: number | undefined;
	answeredParticipantIds?: number[] | undefined;
	resultUuid?: string | null | undefined;
	isHost: boolean;
}

export interface GameFinishedDto {
	totalQuestions: number;
	leaderboard: ParticipantDto[];
}

export interface QuestionReportDto {
	questionId: number;
	questionNumber: number;
	text: string;
	media?: string | null | undefined;
	type: string;
	points: number;
	earnedPoints: number;
	timeSpentSec: number;
	status: "CORRECT" | "INCORRECT" | "SKIPPED";
	studentAnswer: string;
	correctAnswer: string;
	isCorrect: boolean;
	isSkipped: boolean;
}

export interface StudentResultReportDto {
	resultUuid: string;
	score: number;
	correctAnswersCount: number;
	incorrectAnswersCount: number;
	skippedAnswersCount: number;
	totalQuestionsCount: number;
	totalTimeSpentSec: number;
	grade: number; // 0..12
	percentage: number; // 0..100
	createdAt: string;

	quiz: {
		id: number;
		uuid: string;
		name: string;
		authorName: string;
		teacherName: string;
	};

	participant: {
		id: number;
		uuid: string;
		nickname: string;
		studentName?: string | null | undefined;
	};

	questions: QuestionReportDto[];
}
