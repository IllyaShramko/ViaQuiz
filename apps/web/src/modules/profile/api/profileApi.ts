import { baseApi } from '../../../shared/api/base-api';
import type { QuizzesResponse } from '../models';

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
  }),
  overrideExisting: false,
});

export const { useGetMyQuizzesQuery } = profileApi;
