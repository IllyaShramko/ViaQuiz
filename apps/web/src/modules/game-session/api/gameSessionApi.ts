import { baseApi } from '../../../shared/api/base-api';
import type {
	CreateRoomDto,
	JoinByCodeDto,
	ParticipantDto,
	StudentResultReportDto,
} from '@viaquiz/shared-types';

export interface RoomResponse {
	id: number;
	uuid: string;
	joinCode: string;
	status: 'AWAITING' | 'PROGRESS' | 'REVIEWING' | 'FINISHED';
	currentQuestionIndex: number;
	quizId: number;
	courseId?: number | null;
	hostId: number;
	quiz?: {
		id: number;
		name: string;
		description?: string | null;
		coverImg?: string | null;
	};
	course?: {
		id: number;
		name: string;
	} | null;
	participants?: ParticipantDto[];
}

export interface ValidateCodeResponse {
	valid: boolean;
	roomUuid: string;
	requiresAuth: boolean;
	status: string;
}

export interface JoinRoomResponse {
	participant: ParticipantDto;
	token: string;
	room: RoomResponse;
}

export const gameSessionApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		createRoom: builder.mutation<RoomResponse, CreateRoomDto>({
			query: (body) => ({
				url: '/game-sessions/rooms',
				method: 'POST',
				body,
			}),
		}),
		validateJoinCode: builder.mutation<ValidateCodeResponse, { joinCode: string }>({
			query: (body) => ({
				url: '/game-sessions/validate-code',
				method: 'POST',
				body,
			}),
		}),
		joinGameRoom: builder.mutation<JoinRoomResponse, JoinByCodeDto>({
			query: (body) => ({
				url: '/game-sessions/join',
				method: 'POST',
				body,
			}),
		}),
		getRoomByUuid: builder.query<RoomResponse, string>({
			query: (uuid) => `/game-sessions/rooms/${uuid}`,
		}),
		getResultReportByUuid: builder.query<StudentResultReportDto, string>({
			query: (uuid) => `/game-sessions/results/${uuid}`,
		}),
	}),
	overrideExisting: false,
});

export const {
	useCreateRoomMutation,
	useValidateJoinCodeMutation,
	useJoinGameRoomMutation,
	useGetRoomByUuidQuery,
	useGetResultReportByUuidQuery,
} = gameSessionApi;
