import { baseApi } from '../../../shared/api/base-api';
import type { QuizzesResponse, QuizzesParams } from '../models';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublishedQuizzes: builder.query<QuizzesResponse, QuizzesParams | void>({
      query: (params) => ({
        url: '/quizzes',
        params: params || undefined,
      }),
      providesTags: ['Quiz'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetPublishedQuizzesQuery } = dashboardApi;
