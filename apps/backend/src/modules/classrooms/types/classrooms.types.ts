import type { Classroom, Course, Student, CourseInvitation, CourseInvitationStatus, Prisma } from "../../../generated/prisma";
import type { z } from "zod";
import type {
	createClassroomSchema,
	updateClassroomSchema,
	createStudentSchema,
	createCourseSchema,
	updateCourseSchema,
	enrollCourseStudentsSchema,
	dateFilterSchema,
	createCourseInvitationSchema,
} from "../classroom.schema";

export type CreateClassroomDTO = z.infer<typeof createClassroomSchema>;
export type UpdateClassroomDTO = z.infer<typeof updateClassroomSchema>;
export type CreateStudentDTO = z.infer<typeof createStudentSchema>;
export type CreateCourseDTO = z.infer<typeof createCourseSchema>;
export type UpdateCourseDTO = z.infer<typeof updateCourseSchema>;
export type EnrollCourseStudentsDTO = z.infer<typeof enrollCourseStudentsSchema>;
export type DateFilterDTO = z.infer<typeof dateFilterSchema>;
export type CreateCourseInvitationDTO = z.infer<typeof createCourseInvitationSchema>;

export type TeacherClassroomSummary = Prisma.ClassroomGetPayload<{
	include: {
		courses: {
			where: { isArchived: false };
		};
		_count: {
			select: {
				students: true;
				courses: {
					where: { isArchived: false };
				};
			};
		};
	};
}>;

export type AssignedCourseSummary = {
	id: number;
	uuid: string;
	name: string;
	isActive: boolean;
	createdAt: Date;
	classroom: {
		id: number;
		uuid: string;
		name: string;
		code: string | null;
	};
	creator: {
		id: number;
		uuid: string;
		firstName: string | null;
		lastName: string | null;
		login: string;
		email: string;
	};
	_count: {
		students: number;
		rooms: number;
	};
};

export type CourseInvitationWithDetails = Prisma.CourseInvitationGetPayload<{
	include: {
		course: {
			select: {
				id: true;
				uuid: true;
				name: true;
				classroom: {
					select: {
						id: true;
						uuid: true;
						name: true;
					};
				};
			};
		};
		sender: {
			select: {
				id: true;
				uuid: true;
				firstName: true;
				lastName: true;
				login: true;
				email: true;
			};
		};
		receiver: {
			select: {
				id: true;
				uuid: true;
				firstName: true;
				lastName: true;
				login: true;
				email: true;
			};
		};
	};
}>;

export type ClassroomStudentItem = {
	id: number;
	uuid: string;
	firstName: string;
	lastName: string;
	login: string;
	createdAt: Date;
	_count: {
		passedQuizes: number;
	};
};

export type ClassroomCourseItem = Prisma.CourseGetPayload<{
	where: { isArchived: false };
	include: {
		_count: {
			select: {
				students: true;
				rooms: true;
			};
		};
	};
}>;

export type ClassroomTeacher = {
	id: number;
	firstName: string | null;
	lastName: string | null;
	login: string;
};

export type ClassroomDetail = Prisma.ClassroomGetPayload<{
	include: {
		students: {
			select: {
				id: true;
				uuid: true;
				firstName: true;
				lastName: true;
				login: true;
				createdAt: true;
				_count: {
					select: {
						passedQuizes: true;
					};
				};
			};
		};
		courses: {
			where: { isArchived: false };
			include: {
				_count: {
					select: {
						students: true;
						rooms: true;
					};
				};
			};
		};
		teacher: {
			select: {
				id: true;
				firstName: true;
				lastName: true;
				login: true;
			};
		};
		_count: {
			select: {
				students: true;
				courses: true;
			};
		};
	};
}>;

export type StudentWithGlobalClassroom = Prisma.StudentGetPayload<{
	include: {
		classroom: {
			select: {
				id: true;
				uuid: true;
				name: true;
				code: true;
				teacherId: true;
			};
		};
	};
}>;

export type StudentWithDetails = Prisma.StudentGetPayload<{
	include: {
		classroom: {
			select: {
				id: true;
				uuid: true;
				name: true;
				code: true;
				teacherId: true;
				teacher: {
					select: {
						id: true;
						firstName: true;
						lastName: true;
					};
				};
			};
		};
		courses: {
			where: { isArchived: false };
			select: {
				id: true;
				uuid: true;
				name: true;
			};
		};
	};
}>;

export type CourseWithDetails = Prisma.CourseGetPayload<{
	include: {
		students: {
			select: {
				id: true;
				uuid: true;
				firstName: true;
				lastName: true;
				login: true;
				createdAt: true;
				_count: {
					select: {
						passedQuizes: true;
					};
				};
			};
		};
		classroom: {
			select: {
				id: true;
				uuid: true;
				name: true;
				code: true;
			};
		};
		creator: {
			select: {
				id: true;
				uuid: true;
				firstName: true;
				lastName: true;
				login: true;
				email: true;
			};
		};
		teacher: {
			select: {
				id: true;
				uuid: true;
				firstName: true;
				lastName: true;
				login: true;
				email: true;
			};
		};
		invitations: {
			where: {
				status: "PENDING";
			};
			select: {
				id: true;
				uuid: true;
				token: true;
				invitedEmail: true;
				invitedLogin: true;
				status: true;
				expiresAt: true;
				createdAt: true;
				receiver: {
					select: {
						id: true;
						uuid: true;
						firstName: true;
						lastName: true;
						login: true;
						email: true;
					};
				};
			};
		};
		_count: {
			select: {
				students: true;
				rooms: true;
			};
		};
	};
}>;

export type CourseWithStudents = Prisma.CourseGetPayload<{
	include: {
		students: {
			select: {
				id: true;
				uuid: true;
				firstName: true;
				lastName: true;
				login: true;
			};
		};
	};
}>;

export type RawStudentQuizResult = Prisma.ParticipantGetPayload<{
	include: {
		result: true;
		room: {
			select: {
				id: true;
				uuid: true;
				quiz: {
					select: {
						id: true;
						uuid: true;
						name: true;
						coverImg: true;
					};
				};
				course: {
					select: {
						id: true;
						uuid: true;
						name: true;
					};
				};
			};
		};
	};
}>;

export interface ClassroomLimitsInfo {
	maxClasses: number;
	currentActiveClasses: number;
	maxTotalCourses: number;
	currentActiveCourses: number;
	maxStudentsPerClass: number;
	maxCoursesPerClass: number;
	maxStudentsPerCourse: number;
}

export interface GetClassroomsResponse {
	classrooms: TeacherClassroomSummary[];
	assignedCourses: AssignedCourseSummary[];
	pendingInvitationsCount: number;
	limits: ClassroomLimitsInfo;
}

export interface VerifyInvitationResponse {
	isValid: boolean;
	courseName: string;
	classroomName: string;
	senderName: string;
	invitedEmail: string | null;
	invitedLogin: string | null;
}

export type SafeStudent = Prisma.StudentGetPayload<{ omit: { password: true } }>;

export interface CreatedStudentWithCredentials {
	student: SafeStudent;
	credentials: {
		login: string;
		password: string;
		firstName: string;
		lastName: string;
	};
}

export interface ResetStudentPasswordResult {
	studentUuid: string;
	studentName: string;
	login: string;
	newPassword: string;
}

export interface StudentAnalyticsHistoryItem {
	id: number;
	uuid: string;
	date: string;
	fullDate: string;
	joinTime: string;
	joinedAt: Date | string;
	score: number;
	grade: number;
	correctAnswersCount: number;
	totalQuestionsCount: number;
	quizTitle: string;
	quizCoverImage: string | null;
	courseName: string;
}

export interface StudentAnalyticsResponse {
	student: {
		id: number;
		uuid: string;
		firstName: string;
		lastName: string;
		login: string;
		classroomName: string;
		classroomId: number;
		classroomUuid: string;
		courses: Array<{
			id: number;
			uuid: string;
			name: string;
		}>;
	};
	stats: {
		totalTests: number;
		averageGrade: number;
		accuracyPercentage: number;
		totalCorrectAnswers: number;
		totalQuestions: number;
	};
	charts: {
		progress: {
			categories: string[];
			grades: number[];
			scores: number[];
			quizTitles: string[];
		};
		distribution: {
			labels: string[];
			series: number[];
		};
	};
	history: StudentAnalyticsHistoryItem[];
}
