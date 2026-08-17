import { baseApi } from '../../../shared/api/base-api';
import type {
  QuizAuthor,
  PublicQuizSummary,
  QuizDetail,
  QuizQuestion,
  QuestionVariant,
  QuizzesResponse,
  QuizzesParams,
} from '../models';

export type {
  QuizAuthor,
  PublicQuizSummary,
  QuizDetail,
  QuizQuestion,
  QuestionVariant,
  QuizzesResponse,
  QuizzesParams,
};

export const quizApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublishedQuizzes: builder.query<QuizzesResponse, QuizzesParams | void>({
      query: (params) => ({
        url: '/quizzes',
        params: params || undefined,
      }),
      providesTags: ['Quiz'],
    }),
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
    getQuizById: builder.query<QuizDetail, number | string>({
      query: (id) => `/quizzes/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Quiz', id }],
    }),
    getQuizByUuid: builder.query<QuizDetail, string>({
      query: (uuid) => `/quizzes/uuid/${uuid}`,
      providesTags: (_result, _error, uuid) => [{ type: 'Quiz', id: uuid }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPublishedQuizzesQuery,
  useGetMyQuizzesQuery,
  useGetQuizByIdQuery,
  useGetQuizByUuidQuery,
} = quizApi;
