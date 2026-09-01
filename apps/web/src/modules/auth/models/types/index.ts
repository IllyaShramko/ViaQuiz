export type UserRole = 'TEACHER' | 'STUDENT' | 'ADMIN';

export interface User {
  id: number;
  uuid: string;
  email: string;
  login: string;
  firstName: string | null;
  lastName: string | null;
  role?: UserRole;
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

export interface LoginFormInputs {
  email: string;
  password: string;
}

export interface RegisterFormInputs {
  login: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  code: string;
}
