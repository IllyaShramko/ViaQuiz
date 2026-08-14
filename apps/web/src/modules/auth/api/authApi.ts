import { baseApi } from '../../../shared/api/base-api';
import type {
  User,
  AuthResult,
  LoginData,
  RegisterData,
  CheckUniqueData,
  CheckUniqueResult,
  SendCodeData,
  SendCodeResult,
} from '../models';

export type {
  User,
  AuthResult,
  LoginData,
  RegisterData,
  CheckUniqueData,
  CheckUniqueResult,
  SendCodeData,
  SendCodeResult,
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResult, LoginData>({
      query: (credentials) => ({
        url: '/users/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    register: builder.mutation<AuthResult, RegisterData>({
      query: (data) => ({
        url: '/users/register',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    checkUnique: builder.mutation<CheckUniqueResult, CheckUniqueData>({
      query: (data) => ({
        url: '/users/check-unique',
        method: 'POST',
        body: data,
      }),
    }),
    sendCode: builder.mutation<SendCodeResult, SendCodeData>({
      query: (data) => ({
        url: '/users/send-code',
        method: 'POST',
        body: data,
      }),
    }),
    getMe: builder.query<User, void>({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useCheckUniqueMutation,
  useSendCodeMutation,
  useGetMeQuery,
} = authApi;
