import { baseApi } from '../../../shared/api/base-api';
import type {
  QuizAuthor,
  Keyword,
  PublicQuizSummary,
  QuizzesResponse,
  QuizzesParams,
} from '../models';

export type {
  QuizAuthor,
  Keyword,
  PublicQuizSummary,
  QuizzesResponse,
  QuizzesParams,
};

export const quizApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublishedQuizzes: builder.query<QuizzesResponse, QuizzesParams>({
      query: (params) => ({
        url: '/quizzes',
        params,
      }),
      providesTags: ['Quiz'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetPublishedQuizzesQuery } = quizApi;
