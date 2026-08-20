export interface AuthenticatedUser {
	userId?: number | undefined;
	studentId?: number | undefined;
	email?: string | undefined;
	login?: string | undefined;
	role?: string | undefined;
	classroomId?: number | undefined;
}
