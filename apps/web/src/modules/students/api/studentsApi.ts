import { baseApi } from '../../../shared/api/base-api';
import type { StudentDashboardDto } from '@viaquiz/shared-types';

export interface StudentLoginRequest {
  login: string;
  password: string;
  classCode?: string;
}

export interface StudentLoginResponse {
  token: string;
  student: {
    id: number;
    uuid: string;
    firstName: string;
    lastName: string;
    login: string;
    classroomId: number;
    classroomName: string;
    classroomCode: string | null;
  };
}

export interface StudentResultsResponse {
  results: Array<{
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
  total: number;
}

export const studentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    studentLogin: builder.mutation<StudentLoginResponse, StudentLoginRequest>({
      query: (body) => ({
        url: '/students/login',
        method: 'POST',
        body,
      }),
    }),

    getStudentDashboard: builder.query<StudentDashboardDto, void>({
      query: () => '/students/dashboard',
      providesTags: ['Student'],
    }),

    getStudentMe: builder.query<any, void>({
      query: () => '/students/me',
      providesTags: ['Student'],
    }),

    getStudentResults: builder.query<StudentResultsResponse, { take?: number; skip?: number }>({
      query: ({ take = 20, skip = 0 }) => `/students/results?take=${take}&skip=${skip}`,
      providesTags: ['Student'],
    }),

    getStudentCourses: builder.query<any, void>({
      query: () => '/students/courses',
      providesTags: ['Student'],
    }),
  }),
});

export const {
  useStudentLoginMutation,
  useGetStudentDashboardQuery,
  useGetStudentMeQuery,
  useGetStudentResultsQuery,
  useGetStudentCoursesQuery,
} = studentsApi;
