export {
  authApi,
  useLoginMutation,
  useRegisterMutation,
  useCheckUniqueMutation,
  useSendCodeMutation,
  useGetMeQuery,
} from './api/authApi';
export {
  UserContext,
  useUserContext,
  useAuth,
  UserContextProvider,
  type UserContextContract,
  type UserContextProviderProps,
} from './context';
export type {
  User,
  UserRole,
  AuthResult,
  LoginData,
  RegisterData,
  CheckUniqueData,
  CheckUniqueResult,
  SendCodeData,
  SendCodeResult,
  LoginFormInputs,
  RegisterFormInputs,
} from './models';
export {
  AuthCard,
  LoginForm,
  PasswordInput,
  RegisterForm,
  RegisterSteps,
  StepCredentials,
  StepProfile,
  StepVerification,
  type AuthCardProps,
  type LoginFormProps,
  type AuthRole,
  type PasswordInputProps,
  type RegisterFormProps,
  type RegisterStepsProps,
  type StepCredentialsProps,
  type StepProfileProps,
  type StepVerificationProps,
} from './ui';
export { getUserDashboardPath, isStudent, isTeacher, getSafeRedirectUrl, createLoginRedirectUrl } from './utils';

