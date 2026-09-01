export interface ClassroomLimits {
	maxClasses: number;
	currentActiveClasses: number;
	maxTotalCourses: number;
	currentActiveCourses: number;
	maxStudentsPerClass: number;
	maxCoursesPerClass: number;
	maxStudentsPerCourse: number;
}

export interface StudentDto {
	id: number;
	uuid: string;
	firstName: string;
	lastName: string;
	login: string;
	createdAt?: string;
	_count?: {
		passedQuizes: number;
	};
}

export interface CourseDto {
	id: number;
	uuid: string;
	name: string;
	isActive: boolean;
	isArchived: boolean;
	createdAt: string;
	classroomId?: number;
	classroom?: {
		id: number;
		uuid: string;
		name: string;
		code?: string | null;
		students?: StudentDto[];
	};
	students?: StudentDto[];
	_count?: {
		students: number;
		rooms: number;
	};
}

export interface ClassroomDto {
	id: number;
	uuid: string;
	name: string;
	code: string | null;
	isActive: boolean;
	isArchived: boolean;
	createdAt: string;
	updatedAt: string;
	students?: StudentDto[];
	courses?: CourseDto[];
	_count?: {
		students: number;
		courses: number;
	};
}

export interface StudentAnalyticsDto {
	student: {
		id: number;
		uuid: string;
		firstName: string;
		lastName: string;
		login: string;
		classroomName: string;
		classroomId: number;
		classroomUuid: string;
		courses?: Array<{ id: number; uuid: string; name: string }>;
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
	history: Array<{
		id: number;
		uuid: string;
		resultUuid?: string;
		date: string;
		fullDate: string;
		joinTime: string;
		joinedAt: string;
		score: number;
		grade: number;
		correctAnswersCount: number;
		totalQuestionsCount: number;
		quizTitle: string;
		quizCoverImage: string | null;
		courseName: string;
	}>;
}

export interface StudentDashboardDto {
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
	recentResults: Array<{
		id: number;
		uuid: string;
		resultUuid?: string;
		date: string;
		joinTime: string;
		joinedAt: string;
		score: number;
		grade: number;
		correctAnswersCount: number;
		totalQuestionsCount: number;
		quizTitle: string;
		quizCoverImage: string | null;
		courseName: string;
	}>;
	courses: Array<{
		id: number;
		uuid: string;
		name: string;
		roomsCount: number;
	}>;
}
