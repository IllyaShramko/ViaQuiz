import type {
	GameFinishedDto,
	GameQuestionDto,
	GameReviewDataDto,
	GameSyncStateDto,
} from "./game-session";

export const SOCKET_EVENTS = {
	CLIENT: {
		JOIN: "game:join",
		START_GAME: "host:start_game",
		NEXT_QUESTION: "host:next_question",
		END_QUESTION: "host:end_question",
		EXTEND_TIME: "host:extend_time",
		KICK_PARTICIPANT: "host:kick_participant",
		SUBMIT_ANSWER: "participant:submit_answer",
	},
	SERVER: {
		SYNC_STATE: "game:sync_state",
		PARTICIPANT_JOINED: "room:participant_joined",
		PARTICIPANT_LEFT: "room:participant_left",
		PARTICIPANT_KICKED: "room:participant_kicked",
		QUESTION_STARTED: "game:question_started",
		TIME_EXTENDED: "game:time_extended",
		ANSWER_RECEIVED: "game:answer_received",
		QUESTION_ENDED: "game:question_ended",
		FINISHED: "game:finished",
		FINISHED_RESULT: "game:finished_result",
	},
} as const;

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

export interface GameJoinPayload {
	roomUuid?: string;
	joinCode?: string;
}

export interface GameHostRoomPayload {
	roomId: number;
}

export interface GameExtendTimePayload {
	roomId: number;
	seconds?: number;
}

export interface GameKickParticipantPayload {
	roomId: number;
	participantId: number;
}

export interface GameSubmitAnswerPayload {
	roomId: number;
	questionIndex: number;
	variantIds?: number[];
	typedAnswer?: string;
}

export interface ParticipantJoinedPayload {
	participantId: number;
	nickname: string;
	totalCount?: number;
}

export interface ParticipantLeftPayload {
	participantId: number;
	kicked?: boolean;
}

export interface ParticipantKickedPayload {
	reason?: string;
}

export interface TimeExtendedPayload {
	addedSeconds: number;
	newRemainingMs: number;
}

export interface AnswerReceivedPayload {
	participantId?: number;
	answeredCount: number;
	totalParticipants: number;
}

export interface FinishedResultPayload {
	resultUuid: string;
}

export interface ClientToServerEvents {
	"game:join": (data: GameJoinPayload) => void;
	"host:start_game": (data: GameHostRoomPayload) => void;
	"host:next_question": (data: GameHostRoomPayload) => void;
	"host:end_question": (data: GameHostRoomPayload) => void;
	"host:extend_time": (data: GameExtendTimePayload) => void;
	"host:kick_participant": (data: GameKickParticipantPayload) => void;
	"participant:submit_answer": (data: GameSubmitAnswerPayload) => void;
}

export interface ServerToClientEvents {
	"game:sync_state": (payload: GameSyncStateDto) => void;
	"room:participant_joined": (payload: ParticipantJoinedPayload) => void;
	"room:participant_left": (payload: ParticipantLeftPayload) => void;
	"room:participant_kicked": (payload: ParticipantKickedPayload) => void;
	"game:question_started": (payload: GameQuestionDto) => void;
	"game:time_extended": (payload: TimeExtendedPayload) => void;
	"game:answer_received": (payload: AnswerReceivedPayload) => void;
	"game:question_ended": (payload: GameReviewDataDto) => void;
	"game:finished": (payload: GameFinishedDto) => void;
	"game:finished_result": (payload: FinishedResultPayload) => void;
}

export interface InterServerEvents {
	ping: () => void;
}
