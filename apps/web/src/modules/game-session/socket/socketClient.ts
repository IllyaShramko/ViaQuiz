import { io, type Socket } from 'socket.io-client';
import { BASE_URL } from '../../../shared/constants/env';
import { STORAGE_KEYS } from '../../../shared/constants/api';

export const GAME_TOKEN_STORAGE_KEY = 'viaquiz_game_jwt_token';

let socket: Socket | null = null;
let currentSocketToken: string | null = null;

export const getGameSocket = (explicitToken?: string, roomUuid?: string): Socket => {
	const roomToken = roomUuid
		? sessionStorage.getItem(`viaquiz_game_token_${roomUuid}`)
		: null;
	const userToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
	const globalGameToken = sessionStorage.getItem(GAME_TOKEN_STORAGE_KEY);

	// Priority:
	// 1. Explicitly provided token
	// 2. Room-specific token from sessionStorage
	// 3. User login token (for Teacher hosting or logged-in student)
	// 4. Global game token fallback
	const token = explicitToken || roomToken || userToken || globalGameToken || '';

	if (socket && socket.connected && currentSocketToken === token) {
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
	});

	return socket;
};

export const closeGameSocket = (): void => {
	if (socket) {
		socket.disconnect();
		socket = null;
		currentSocketToken = null;
	}
};
