import { baseApi } from '../../../shared/api/base-api';
import type { QuizzesResponse, TeacherProfileStatsDto } from '../models';

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyQuizzes: builder.query<
      QuizzesResponse,
      { isDraft?: boolean; search?: string; page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: '/quizzes/my',
        params: params || undefined,
      }),
      providesTags: ['Quiz'],
    }),
    getProfileStats: builder.query<TeacherProfileStatsDto, void>({
      query: () => '/users/profile/stats',
      providesTags: ['Quiz', 'Classroom'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetMyQuizzesQuery, useGetProfileStatsQuery } = profileApi;
