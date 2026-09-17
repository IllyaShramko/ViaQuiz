import { baseApi } from '../../../shared/api/base-api';
import type { QuizzesResponse, TeacherProfileStatsDto, PublicUserProfileDto } from '../models';

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
    getPublicProfile: builder.query<PublicUserProfileDto, string>({
      query: (uuid) => `/users/public/${uuid}`,
      providesTags: ['User', 'Quiz'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetMyQuizzesQuery, useGetProfileStatsQuery, useGetPublicProfileQuery } = profileApi;

