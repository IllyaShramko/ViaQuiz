export const USER_CONSTRAINTS = {
	LOGIN_MIN_LENGTH: 3,
	LOGIN_MAX_LENGTH: 20,
	LOGIN_REGEX: /^[a-zA-Z0-9_-]+$/,
	PASSWORD_MIN_LENGTH: 6,
	PASSWORD_MAX_LENGTH: 64,
	VERIFICATION_CODE_LENGTH: 6,
	VERIFICATION_CODE_REGEX: /^\d{6}$/,
	FIRST_NAME_MAX_LENGTH: 50,
	LAST_NAME_MAX_LENGTH: 50,
} as const;

export interface User {
	id: string;
	email: string;
	name: string;
	role: "admin" | "user";
	createdAt: string;
}


export interface CreateUserDto {
	email: string;
	name: string;
	password: string;
}

export interface TeacherProfileStatsDto {
	totalQuizzes: number;
	activeClassesCount: number;
	gamesCount: number;
}

export interface PublicUserDto {
	id: number;
	uuid: string;
	login: string;
	firstName: string | null;
	lastName: string | null;
	role?: string;
	createdAt: string | Date;
}

export interface PublicUserStatsDto {
	totalQuizzes: number;
	gamesCount: number;
}

export interface PublicUserProfileDto {
	user: PublicUserDto;
	stats: PublicUserStatsDto;
	quizzes: any[];
}

