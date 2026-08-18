import { baseApi } from '../../../shared/api/base-api';
import type {
  QuizAuthor,
  PublicQuizSummary,
  QuizzesResponse,
  QuizzesParams,
} from '../models';

export type {
  QuizAuthor,
  PublicQuizSummary,
  QuizzesResponse,
  QuizzesParams,
};

export const homeQuizApi = baseApi.injectEndpoints({
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

export const {
  useGetPublishedQuizzesQuery,
} = homeQuizApi;
