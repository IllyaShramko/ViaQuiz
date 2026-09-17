import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@viaquiz/shared-types';
import { BASE_URL } from '../../../shared/constants/env';
import { STORAGE_KEYS } from '../../../shared/constants/api';
import { getGameSessionToken } from '../utils/gameStorage';

export type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export const GAME_TOKEN_STORAGE_KEY = 'viaquiz_game_jwt_token';

let socket: GameSocket | null = null;
let currentSocketToken: string | null = null;

export const getGameSocket = (explicitToken?: string, roomUuid?: string): GameSocket => {
	const roomToken = roomUuid
		? (getGameSessionToken(roomUuid) || sessionStorage.getItem(`viaquiz_game_token_${roomUuid}`))
		: null;
	const userToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
	const globalGameToken = sessionStorage.getItem(GAME_TOKEN_STORAGE_KEY);

	// Priority:
	// 1. Explicitly provided token
	// 2. Room-specific token from gameStorage / sessionStorage
	// 3. User login token (for Teacher hosting or logged-in student)
	// 4. Global game token fallback
	const token = explicitToken || roomToken || userToken || globalGameToken || '';

	if (socket && currentSocketToken === token) {
		return socket;
	}

	if (socket) {
		socket.disconnect();
		socket = null;
	}

	currentSocketToken = token;
	socket = io(BASE_URL, {
		auth: { token },
		autoConnect: true,
		reconnection: true,
		reconnectionAttempts: 10,
		reconnectionDelay: 1000,
		transports: ['websocket', 'polling'],
	}) as GameSocket;

	return socket;
};

export const closeGameSocket = (): void => {
	if (socket) {
		socket.disconnect();
		socket = null;
		currentSocketToken = null;
	}
};
