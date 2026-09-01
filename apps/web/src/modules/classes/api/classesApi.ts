import { baseApi } from '../../../shared/api/base-api';
import type {
  ClassroomDto,
  ClassroomLimits,
  CourseDto,
  StudentAnalyticsDto,
  StudentDto,
} from '@viaquiz/shared-types';

export interface GetClassroomsResponse {
  classrooms: ClassroomDto[];
  limits: ClassroomLimits;
}

export interface CreateClassroomRequest {
  name: string;
  code?: string;
}

export interface UpdateClassroomRequest {
  name?: string;
  isActive?: boolean;
  isArchived?: boolean;
}

export interface AddStudentRequest {
  firstName: string;
  lastName: string;
  login?: string;
  password?: string;
}

export interface AddStudentResponse {
  student: StudentDto;
  credentials: {
    login: string;
    password: string;
    firstName: string;
    lastName: string;
  };
}

export interface ResetPasswordResponse {
  studentUuid: string;
  studentName: string;
  login: string;
  newPassword: string;
}

export interface CreateCourseRequest {
  name: string;
  studentUuids?: string[];
}

export interface UpdateCourseRequest {
  name?: string;
  studentUuids?: string[];
  isActive?: boolean;
  isArchived?: boolean;
}

export const classesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClassrooms: builder.query<GetClassroomsResponse, void>({
      query: () => '/classrooms',
      providesTags: ['Classroom'],
    }),

    getClassroom: builder.query<ClassroomDto, string>({
      query: (uuid) => `/classrooms/${uuid}`,
      providesTags: (_result, _error, uuid) => [{ type: 'Classroom', id: uuid }],
    }),

    createClassroom: builder.mutation<ClassroomDto, CreateClassroomRequest>({
      query: (body) => ({
        url: '/classrooms',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Classroom'],
    }),

    updateClassroom: builder.mutation<ClassroomDto, { uuid: string; body: UpdateClassroomRequest }>({
      query: ({ uuid, body }) => ({
        url: `/classrooms/${uuid}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { uuid }) => ['Classroom', { type: 'Classroom', id: uuid }],
    }),

    deleteClassroom: builder.mutation<{ message: string }, string>({
      query: (uuid) => ({
        url: `/classrooms/${uuid}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Classroom'],
    }),

    addStudent: builder.mutation<AddStudentResponse, { classUuid: string; body: AddStudentRequest }>({
      query: ({ classUuid, body }) => ({
        url: `/classrooms/${classUuid}/students`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { classUuid }) => [
        'Classroom',
        { type: 'Classroom', id: classUuid },
      ],
    }),

    resetStudentPassword: builder.mutation<ResetPasswordResponse, { classUuid: string; studentUuid: string }>({
      query: ({ classUuid, studentUuid }) => ({
        url: `/classrooms/${classUuid}/students/${studentUuid}/reset-password`,
        method: 'POST',
      }),
    }),

    deleteStudent: builder.mutation<{ message: string }, { classUuid: string; studentUuid: string }>({
      query: ({ classUuid, studentUuid }) => ({
        url: `/classrooms/${classUuid}/students/${studentUuid}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { classUuid }) => [
        'Classroom',
        { type: 'Classroom', id: classUuid },
      ],
    }),

    getStudentAnalytics: builder.query<
      StudentAnalyticsDto,
      { classUuid: string; studentUuid: string; from?: string; to?: string }
    >({
      query: ({ classUuid, studentUuid, from, to }) => {
        const params = new URLSearchParams();
        if (from) params.append('from', from);
        if (to) params.append('to', to);
        const qs = params.toString();
        return `/classrooms/${classUuid}/students/${studentUuid}${qs ? `?${qs}` : ''}`;
      },
      providesTags: (_result, _error, { studentUuid }) => [{ type: 'Student', id: studentUuid }],
    }),

    getCourse: builder.query<CourseDto, { classUuid: string; courseUuid: string }>({
      query: ({ classUuid, courseUuid }) => `/classrooms/${classUuid}/courses/${courseUuid}`,
      providesTags: (_result, _error, { courseUuid }) => [
        'Classroom',
        'Course',
        { type: 'Course', id: courseUuid },
      ],
    }),

    createCourse: builder.mutation<CourseDto, { classUuid: string; body: CreateCourseRequest }>({
      query: ({ classUuid, body }) => ({
        url: `/classrooms/${classUuid}/courses`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { classUuid }) => [
        'Classroom',
        'Course',
        { type: 'Classroom', id: classUuid },
      ],
    }),

    updateCourse: builder.mutation<
      CourseDto,
      { classUuid: string; courseUuid: string; body: UpdateCourseRequest }
    >({
      query: ({ classUuid, courseUuid, body }) => ({
        url: `/classrooms/${classUuid}/courses/${courseUuid}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { classUuid, courseUuid }) => [
        'Classroom',
        'Course',
        { type: 'Classroom', id: classUuid },
        { type: 'Course', id: courseUuid },
      ],
    }),

    enrollStudentsToCourse: builder.mutation<
      CourseDto,
      { classUuid: string; courseUuid: string; studentUuids: string[] }
    >({
      query: ({ classUuid, courseUuid, studentUuids }) => ({
        url: `/classrooms/${classUuid}/courses/${courseUuid}/students`,
        method: 'POST',
        body: { studentUuids },
      }),
      invalidatesTags: (_result, _error, { classUuid, courseUuid }) => [
        'Classroom',
        'Course',
        { type: 'Classroom', id: classUuid },
        { type: 'Course', id: courseUuid },
      ],
    }),

    unenrollStudentFromCourse: builder.mutation<
      { message: string },
      { classUuid: string; courseUuid: string; studentUuid: string }
    >({
      query: ({ classUuid, courseUuid, studentUuid }) => ({
        url: `/classrooms/${classUuid}/courses/${courseUuid}/students/${studentUuid}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { classUuid, courseUuid }) => [
        'Classroom',
        'Course',
        { type: 'Classroom', id: classUuid },
        { type: 'Course', id: courseUuid },
      ],
    }),

    deleteCourse: builder.mutation<{ message: string }, { classUuid: string; courseUuid: string }>({
      query: ({ classUuid, courseUuid }) => ({
        url: `/classrooms/${classUuid}/courses/${courseUuid}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { classUuid, courseUuid }) => [
        'Classroom',
        'Course',
        { type: 'Classroom', id: classUuid },
        { type: 'Course', id: courseUuid },
      ],
    }),
  }),
});

export const {
  useGetClassroomsQuery,
  useGetClassroomQuery,
  useCreateClassroomMutation,
  useUpdateClassroomMutation,
  useDeleteClassroomMutation,
  useAddStudentMutation,
  useResetStudentPasswordMutation,
  useDeleteStudentMutation,
  useGetStudentAnalyticsQuery,
  useGetCourseQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useEnrollStudentsToCourseMutation,
  useUnenrollStudentFromCourseMutation,
  useDeleteCourseMutation,
} = classesApi;
