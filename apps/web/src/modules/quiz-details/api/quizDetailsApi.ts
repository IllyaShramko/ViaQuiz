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
    toggleLike: builder.mutation<{ isLiked: boolean; likesCount: number }, string>({
      query: (uuid) => ({
        url: `/quizzes/uuid/${uuid}/like`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, uuid) => [
        { type: 'Quiz', id: uuid },
        { type: 'Quiz', id: 'MY_LIST' },
        { type: 'Quiz', id: 'LIKED_LIST' },
      ],
    }),
    recordView: builder.mutation<{ success: boolean }, string>({
      query: (uuid) => ({
        url: `/quizzes/uuid/${uuid}/view`,
        method: 'POST',
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetQuizByUuidQuery,
  useGetQuizByIdQuery,
  useToggleLikeMutation,
  useRecordViewMutation,
} = quizDetailsApi;
