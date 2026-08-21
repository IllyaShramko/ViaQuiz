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
	variantIds: number[];
}

export interface RoomDetailsDto {
	id: number;
	uuid: string;
	joinCode: string;
	status: RoomStatus;
	currentQuestionIndex: number;
	quizId: number;
	courseId?: number | null | undefined;
	hostId: number;
	startedAt?: Date | null | undefined;
	endedAt?: Date | null | undefined;
	createdAt: Date;
}

export type { QuestionReportDto, StudentResultReportDto } from "@viaquiz/shared-types";

