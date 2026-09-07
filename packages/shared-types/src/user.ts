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
