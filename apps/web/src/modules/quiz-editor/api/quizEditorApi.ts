import { baseApi } from '../../../shared/api/base-api';
import type {
  EditorQuiz,
  EditorQuestion,
  CreateQuizPayload,
  UpdateQuizPayload,
  CreateQuestionPayload,
  UpdateQuestionPayload,
  ReorderPayload,
} from '../models/types';

export const quizEditorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createQuiz: builder.mutation<EditorQuiz, CreateQuizPayload>({
      query: (body) => ({
        url: '/quizzes',
        method: 'POST',
        body,
      }),
    }),

    updateQuiz: builder.mutation<EditorQuiz, { id: number; body: UpdateQuizPayload }>({
      query: ({ id, body }) => ({
        url: `/quizzes/${id}`,
        method: 'PATCH',
        body,
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            quizEditorApi.util.updateQueryData('getQuizForEditor', id, (draft) => {
              Object.assign(draft, data);
            })
          );
        } catch {
          // ignore or handle error
        }
      },
    }),

    publishQuiz: builder.mutation<EditorQuiz, number>({
      query: (id) => ({
        url: `/quizzes/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Quiz', id }, 'Quiz'],
    }),

    deleteQuiz: builder.mutation<void, number>({
      query: (id) => ({
        url: `/quizzes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Quiz'],
    }),

    getQuizForEditor: builder.query<EditorQuiz, string | number>({
      query: (idOrUuid) => `/quizzes/${idOrUuid}`,
      providesTags: (_result, _error, idOrUuid) => [{ type: 'Quiz', id: idOrUuid }, 'Quiz'],
    }),

    createQuestion: builder.mutation<EditorQuestion, { quizId: number; body: CreateQuestionPayload }>({
      query: ({ quizId, body }) => ({
        url: `/questions/quiz/${quizId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { quizId }) => [{ type: 'Quiz', id: quizId }],
    }),

    updateQuestion: builder.mutation<EditorQuestion, { id: number; quizId: number; body: UpdateQuestionPayload }>({
      query: ({ id, body }) => ({
        url: `/questions/${id}`,
        method: 'PUT',
        body,
      }),
      async onQueryStarted({ id, quizId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            quizEditorApi.util.updateQueryData('getQuizForEditor', quizId, (draft) => {
              const qIndex = draft.questions.findIndex((q) => q.id === id);
              if (qIndex !== -1) {
                draft.questions[qIndex] = data;
              }
            })
          );
        } catch {
          // ignore or handle error
        }
      },
    }),

    deleteQuestion: builder.mutation<void, number>({
      query: (id) => ({
        url: `/questions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Quiz'],
    }),

    duplicateQuestion: builder.mutation<EditorQuestion, number>({
      query: (id) => ({
        url: `/questions/${id}/duplicate`,
        method: 'POST',
      }),
      invalidatesTags: ['Quiz'],
    }),

    reorderQuestions: builder.mutation<EditorQuestion[], { quizId: number; body: ReorderPayload }>({
      query: ({ quizId, body }) => ({
        url: `/questions/quiz/${quizId}/order`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { quizId }) => [{ type: 'Quiz', id: quizId }],
    }),

    uploadImage: builder.mutation<{ success: boolean; data: { url: string; publicId: string } }, FormData>({
      query: (formData) => ({
        url: '/upload/image',
        method: 'POST',
        body: formData,
      }),
    }),

    getMyDrafts: builder.query<
      { quizzes: EditorQuiz[]; total: number },
      { sortBy?: 'updatedAt' | 'createdAt'; sortOrder?: 'asc' | 'desc' } | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams({ isDraft: 'true' });
        if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
        return `/quizzes/my?${searchParams.toString()}`;
      },
      providesTags: ['Quiz'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateQuizMutation,
  useUpdateQuizMutation,
  usePublishQuizMutation,
  useDeleteQuizMutation,
  useGetQuizForEditorQuery,
  useGetMyDraftsQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useDuplicateQuestionMutation,
  useReorderQuestionsMutation,
  useUploadImageMutation,
} = quizEditorApi;
