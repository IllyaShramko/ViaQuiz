import { baseApi } from '../../../shared/api/base-api';
import type {
  StudentDashboardDto,
  StudentClassroomDetailsDto,
  ClassmateProfileDto,
} from '@viaquiz/shared-types';

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

export interface GetStudentResultsParams {
  take?: number;
  skip?: number;
  from?: string;
  to?: string;
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

    getStudentResults: builder.query<StudentResultsResponse, GetStudentResultsParams | void>({
      query: (params) => {
        const take = params?.take ?? 20;
        const skip = params?.skip ?? 0;
        const searchParams = new URLSearchParams({
          take: String(take),
          skip: String(skip),
        });
        if (params?.from) searchParams.set('from', params.from);
        if (params?.to) searchParams.set('to', params.to);
        return `/students/results?${searchParams.toString()}`;
      },
      providesTags: ['Student'],
    }),

    getStudentCourses: builder.query<any, void>({
      query: () => '/students/courses',
      providesTags: ['Student'],
    }),

    getStudentClassroom: builder.query<StudentClassroomDetailsDto, void>({
      query: () => '/students/classroom',
      providesTags: ['Student'],
    }),

    getClassmateProfile: builder.query<ClassmateProfileDto, string>({
      query: (uuid) => `/students/classmates/${uuid}`,
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
  useGetStudentClassroomQuery,
  useGetClassmateProfileQuery,
} = studentsApi;

