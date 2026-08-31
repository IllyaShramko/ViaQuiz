import type { Socket, Server as SocketIOServer } from "socket.io";

export interface SocketData {
	userId?: number | undefined;
	role?: "TEACHER" | "STUDENT" | "ANONYMOUS" | undefined;
	participantId?: number | undefined;
	participantUuid?: string | undefined;
	roomId?: number | undefined;
	roomUuid?: string | undefined;
	nickname?: string | undefined;
	studentId?: number | null | undefined;
}

export interface ClientToServerEvents {
	"game:join": (data: { roomUuid?: string; joinCode?: string }) => void;
	"host:start_game": (data: { roomId: number }) => void;
	"host:next_question": (data: { roomId: number }) => void;
	"host:end_question": (data: { roomId: number }) => void;
	"host:extend_time": (data: { roomId: number; seconds?: number }) => void;
	"host:kick_participant": (data: {
		roomId: number;
		participantId: number;
	}) => void;
	"participant:submit_answer": (data: {
		roomId: number;
		questionIndex: number;
		variantIds?: number[];
		typedAnswer?: string;
	}) => void;
}

export interface ServerToClientEvents {
	"game:sync_state": (payload: unknown) => void;
	"room:participant_joined": (payload: unknown) => void;
	"room:participant_left": (payload: unknown) => void;
	"room:participant_kicked": (payload: { reason?: string }) => void;
	"game:question_started": (payload: unknown) => void;
	"game:time_extended": (payload: {
		addedSeconds: number;
		newRemainingMs: number;
	}) => void;
	"game:answer_received": (payload: {
		participantId: number;
		answeredCount: number;
		totalParticipants: number;
	}) => void;
	"game:question_ended": (payload: unknown) => void;
	"game:finished": (payload: unknown) => void;
	"game:finished_result": (payload: { resultUuid: string }) => void;
}

export interface InterServerEvents {
	ping: () => void;
}

export type AuthenticatedSocket = Socket<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
>;

export type ServerSocket = SocketIOServer<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
>;

export interface SocketController {
	registerHandlers: (
		socket: AuthenticatedSocket,
		ioServer: ServerSocket,
	) => void;
}
