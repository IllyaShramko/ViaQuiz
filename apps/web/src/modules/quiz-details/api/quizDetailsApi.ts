import { baseApi } from '../../../shared/api/base-api';
import type { QuizDetail } from '../models';

export const quizDetailsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getQuizByUuid: builder.query<QuizDetail, string>({
      query: (uuid) => `/quizzes/uuid/${uuid}`,
      providesTags: (_result, _error, uuid) => [{ type: 'Quiz', id: uuid }],
    }),
    getQuizById: builder.query<QuizDetail, number | string>({
      query: (id) => `/quizzes/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Quiz', id }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetQuizByUuidQuery, useGetQuizByIdQuery } = quizDetailsApi;
