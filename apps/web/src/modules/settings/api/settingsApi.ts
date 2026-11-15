import { baseApi } from '../../../shared/api/base-api';
import type {
  ChangeEmailDto,
  ChangePasswordDto,
  ChangePasswordResponseDto,
  SendEmailChangeCodeDto,
  SendPasswordChangeCodeDto,
  UpdateProfileDto,
} from '@viaquiz/shared-types';
import type { AuthResult, SendCodeResult, User } from '../../auth/models';

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation<User, UpdateProfileDto>({
      query: (body) => ({
        url: '/users/me',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    sendEmailChangeCode: builder.mutation<SendCodeResult, SendEmailChangeCodeDto>({
      query: (body) => ({
        url: '/users/me/email/send-code',
        method: 'POST',
        body,
      }),
    }),
    changeEmail: builder.mutation<AuthResult, ChangeEmailDto>({
      query: (body) => ({
        url: '/users/me/email',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    sendPasswordChangeCode: builder.mutation<SendCodeResult, SendPasswordChangeCodeDto>({
      query: (body) => ({
        url: '/users/me/password/send-code',
        method: 'POST',
        body,
      }),
    }),
    changePassword: builder.mutation<ChangePasswordResponseDto, ChangePasswordDto>({
      query: (body) => ({
        url: '/users/me/password',
        method: 'PATCH',
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useUpdateProfileMutation,
  useSendEmailChangeCodeMutation,
  useChangeEmailMutation,
  useSendPasswordChangeCodeMutation,
  useChangePasswordMutation,
} = settingsApi;
