import type { Request, Response, NextFunction } from "express";
import type {
	Room,
	Participant,
	Answer,
	Result,
	Quiz,
	Question,
	Variant,
	Student,
} from "../../../generated/prisma";
import type {
	CreateRoomDto,
	JoinByCodeDto,
	GameJwtPayload,
	SubmitAnswerDto,
	RoomStatus,
	StudentResultReportDto,
} from "./game-sessions.types";

export type QuestionWithVariants = Question & {
	variants: Variant[];
};

export type FullQuizSession = Quiz & {
	questions: QuestionWithVariants[];
};

export interface GameSessionsRepositoryContract {
	createRoom(hostId: number, data: CreateRoomDto, joinCode: string): Promise<Room>;
	findRoomById(id: number): Promise<Room | null>;
	findRoomByUuid(uuid: string): Promise<Room | null>;
	findRoomByJoinCode(joinCode: string): Promise<Room | null>;
	updateRoomStatus(id: number, status: RoomStatus, currentQuestionIndex?: number): Promise<Room>;
	findQuizWithQuestions(quizId: number): Promise<FullQuizSession | null>;
	findStudentById(studentId: number): Promise<Student | null>;
	findCourseById(courseId: number): Promise<any | null>;
	isStudentEnrolledInCourse(studentId: number, courseId: number): Promise<boolean>;
	createParticipant(data: {
		roomId: number;
		nickname: string;
		studentId?: number | null;
	}): Promise<Participant>;
	findParticipantById(id: number): Promise<Participant | null>;
	findParticipantByRoomAndStudent(roomId: number, studentId: number): Promise<Participant | null>;
	findParticipantsByRoomId(roomId: number): Promise<Participant[]>;
	updateParticipantConnection(participantId: number, isConnected: boolean): Promise<Participant>;
	banParticipant(participantId: number): Promise<Participant>;
	deleteParticipant(participantId: number): Promise<Participant>;
	saveAnswer(data: {
		participantId: number;
		questionId: number;
		variantIds?: number[] | undefined;
		typedAnswer?: string | null | undefined;
		timeSpentMs: number;
		scoreEarned?: number | undefined;
		isCorrect: boolean;
		isSkipped?: boolean | undefined;
	}): Promise<Answer>;
	saveResult(data: {
		roomId: number;
		participantId: number;
		score: number;
		correctAnswersCount: number;
		totalQuestionsCount: number;
	}): Promise<Result>;
	findResultByUuid(uuid: string): Promise<any | null>;
}

export interface GameSessionsServiceContract {
	createRoom(hostId: number, data: CreateRoomDto): Promise<Room>;
	validateJoinCode(joinCode: string): Promise<Room>;
	joinRoom(data: JoinByCodeDto, currentUserId?: number): Promise<{
		participant: Participant;
		token: string;
		room: Room;
	}>;
	getRoomByUuid(uuid: string, currentUserId?: number): Promise<Room>;
	getQuizSessionData(quizId: number): Promise<FullQuizSession>;
	generateGameToken(payload: GameJwtPayload): string;
	verifyGameToken(token: string): GameJwtPayload;
	getResultReport(uuid: string): Promise<StudentResultReportDto>;
}

export interface GameSessionsControllerContract {
	createRoom(req: Request, res: Response, next: NextFunction): Promise<void>;
	validateCode(req: Request, res: Response, next: NextFunction): Promise<void>;
	join(req: Request, res: Response, next: NextFunction): Promise<void>;
	getByUuid(req: Request, res: Response, next: NextFunction): Promise<void>;
	getResultReport(req: Request, res: Response, next: NextFunction): Promise<void>;
}
