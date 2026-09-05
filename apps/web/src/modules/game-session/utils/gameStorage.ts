import { STORAGE_KEYS } from '../../../shared/constants/api';

export interface StoredGameSession {
	token: string;
	expiresAt: number; // Date.now() + 12 * 60 * 60 * 1000
	updatedAt: number;
}

export type GameSessionsMap = Record<string, StoredGameSession>;

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
const MAX_SESSIONS = 10;

/**
 * Loads and cleans expired game sessions from localStorage.
 */
function getCleanSessions(): GameSessionsMap {
	try {
		const raw = localStorage.getItem(STORAGE_KEYS.GAME_SESSIONS);
		if (!raw) return {};

		const map = JSON.parse(raw) as GameSessionsMap;
		const now = Date.now();
		const cleanMap: GameSessionsMap = {};
		let hasExpired = false;

		for (const [uuid, session] of Object.entries(map)) {
			if (session && session.token && session.expiresAt && session.expiresAt > now) {
				cleanMap[uuid] = session;
			} else {
				hasExpired = true;
			}
		}

		if (hasExpired) {
			localStorage.setItem(STORAGE_KEYS.GAME_SESSIONS, JSON.stringify(cleanMap));
		}

		return cleanMap;
	} catch {
		return {};
	}
}

/**
 * Retrieves the valid JWT game token for a specific room UUID.
 */
export function getGameSessionToken(roomUuid: string): string | null {
	if (!roomUuid) return null;
	const sessions = getCleanSessions();
	const session = sessions[roomUuid];
	if (session && session.token) {
		return session.token;
	}

	// Fallback to legacy sessionStorage if present
	return sessionStorage.getItem(`viaquiz_game_token_${roomUuid}`);
}

/**
 * Saves a game token for a specific room UUID with a 12-hour TTL and caps storage at MAX_SESSIONS.
 */
export function saveGameSessionToken(roomUuid: string, token: string): void {
	if (!roomUuid || !token) return;

	try {
		const sessions = getCleanSessions();
		const now = Date.now();

		sessions[roomUuid] = {
			token,
			expiresAt: now + TWELVE_HOURS_MS,
			updatedAt: now,
		};

		// Cap at MAX_SESSIONS: if exceeding, remove oldest by updatedAt
		const entries = Object.entries(sessions);
		if (entries.length > MAX_SESSIONS) {
			entries.sort((a, b) => b[1].updatedAt - a[1].updatedAt);
			const trimmedMap: GameSessionsMap = {};
			for (const [k, v] of entries.slice(0, MAX_SESSIONS)) {
				trimmedMap[k] = v;
			}
			localStorage.setItem(STORAGE_KEYS.GAME_SESSIONS, JSON.stringify(trimmedMap));
		} else {
			localStorage.setItem(STORAGE_KEYS.GAME_SESSIONS, JSON.stringify(sessions));
		}

		// Also keep sessionStorage in sync for current tab
		sessionStorage.setItem(`viaquiz_game_token_${roomUuid}`, token);
	} catch {
		// Ignore storage quota errors
	}
}

/**
 * Removes a game session token for a specific room UUID (e.g. on test finish, kick, or invalid token).
 */
export function removeGameSessionToken(roomUuid: string): void {
	if (!roomUuid) return;

	try {
		const sessions = getCleanSessions();
		if (sessions[roomUuid]) {
			delete sessions[roomUuid];
			localStorage.setItem(STORAGE_KEYS.GAME_SESSIONS, JSON.stringify(sessions));
		}
		sessionStorage.removeItem(`viaquiz_game_token_${roomUuid}`);
	} catch {
		// Ignore
	}
}
