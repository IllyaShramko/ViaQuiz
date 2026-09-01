import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../constants';
import { getAuthHeaders } from './headers';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api`,
    prepareHeaders: (headers) => {
      return getAuthHeaders(headers);
    },
  }),
  tagTypes: ['Quiz', 'User', 'Classroom', 'Student', 'Course'],
  endpoints: () => ({}),
});
