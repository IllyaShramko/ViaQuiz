import { baseApi } from '../../../shared/api/base-api';
import type {
  LibraryQueryParams,
  MyQuizzesResponse,
  LikedQuizzesResponse,
} from '../models';

export const libraryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyLibraryQuizzes: builder.query<MyQuizzesResponse, LibraryQueryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set('page', String(params.page));
        if (params?.limit) queryParams.set('limit', String(params.limit));
        if (params?.search) queryParams.set('search', params.search);
        if (params?.sortBy) queryParams.set('sortBy', params.sortBy);
        if (params?.sortOrder) queryParams.set('sortOrder', params.sortOrder);

        const qs = queryParams.toString();
        return `/quizzes/my${qs ? `?${qs}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.quizzes.map(({ uuid }) => ({ type: 'Quiz' as const, id: uuid })),
              { type: 'Quiz', id: 'MY_LIST' },
            ]
          : [{ type: 'Quiz', id: 'MY_LIST' }],
    }),

    getLikedLibraryQuizzes: builder.query<LikedQuizzesResponse, LibraryQueryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set('page', String(params.page));
        if (params?.limit) queryParams.set('limit', String(params.limit));
        if (params?.search) queryParams.set('search', params.search);
        if (params?.sortBy) queryParams.set('sortBy', params.sortBy);
        if (params?.sortOrder) queryParams.set('sortOrder', params.sortOrder);

        const qs = queryParams.toString();
        return `/quizzes/my/liked${qs ? `?${qs}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.quizzes.map(({ uuid }) => ({ type: 'Quiz' as const, id: uuid })),
              { type: 'Quiz', id: 'LIKED_LIST' },
            ]
          : [{ type: 'Quiz', id: 'LIKED_LIST' }],
    }),

    deleteLibraryQuiz: builder.mutation<{ success: boolean; message?: string }, number>({
      query: (id) => ({
        url: `/quizzes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Quiz', id: 'MY_LIST' },
        { type: 'Quiz', id: 'LIKED_LIST' },
      ],
    }),

    toggleLibraryLike: builder.mutation<{ isLiked: boolean; likesCount: number }, string>({
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
  }),
  overrideExisting: false,
});

export const {
  useGetMyLibraryQuizzesQuery,
  useGetLikedLibraryQuizzesQuery,
  useDeleteLibraryQuizMutation,
  useToggleLibraryLikeMutation,
} = libraryApi;
