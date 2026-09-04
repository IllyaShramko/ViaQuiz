import type { Prisma } from "../../../generated/prisma";
import type { z } from "zod";
import type { studentLoginSchema } from "../student.schema";

export type StudentLoginDTO = z.infer<typeof studentLoginSchema>;

export type StudentWithClassroom = Prisma.StudentGetPayload<{
	include: {
		classroom: true;
	};
}>;

export type StudentMe = Prisma.StudentGetPayload<{
	omit: { password: true };
	include: {
		classroom: {
			select: {
				id: true;
				uuid: true;
				name: true;
				code: true;
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
				createdAt: true;
			};
		};
	};
}>;

export type StudentCourse = Prisma.CourseGetPayload<{
	include: {
		classroom: {
			select: {
				id: true;
				uuid: true;
				name: true;
			};
		};
		_count: {
			select: {
				rooms: true;
			};
		};
	};
}>;

export type RawParticipantResult = Prisma.ParticipantGetPayload<{
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

export interface StudentAuthPayload {
	id: number;
	uuid: string;
	firstName: string;
	lastName: string;
	login: string;
	classroomId: number;
	classroomName: string;
	classroomCode: string | null;
}

export interface StudentLoginResponse {
	token: string;
	student: StudentAuthPayload;
}

export interface StudentResultItem {
	id: number;
	uuid: string;
	resultUuid?: string | undefined;
	date: string;
	fullDate?: string | undefined;
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

export type StudentRecentResultItem = StudentResultItem;

export interface StudentDetailedResultItem extends StudentResultItem {
	fullDate: string;
}

export interface StudentResultsResponse {
	results: StudentDetailedResultItem[];
	total: number;
}

export interface StudentDashboardResponse {
	student: {
		id: number;
		uuid: string;
		firstName: string;
		lastName: string;
		login: string;
		classroomName: string;
		classroomCode: string | null;
		teacherName: string;
	};
	stats: {
		totalQuizzesPassed: number;
		averageGrade: number;
		coursesCount: number;
	};
	recentResults: StudentRecentResultItem[];
	courses: Array<{
		id: number;
		uuid: string;
		name: string;
		roomsCount: number;
	}>;
}

export type {
	StudentClassroomDetailsDto,
	ClassmateProfileDto,
	ClassmateSummaryDto,
} from "@viaquiz/shared-types";

