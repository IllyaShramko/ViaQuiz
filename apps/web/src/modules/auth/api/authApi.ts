import { baseApi } from '../../../shared/api/baseApi';

export interface User {
  id: number;
  uuid: string;
  email: string;
  login: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  token: string;
  user: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  login: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  code: string;
}

export interface CheckUniqueData {
  login: string;
  email: string;
}

export interface CheckUniqueResult {
  loginIsTaken: boolean;
  emailIsTaken: boolean;
}

export interface SendCodeData {
  email: string;
}

export interface SendCodeResult {
  message: string;
  cooldownSeconds: number;
}

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
