export const API_ENDPOINTS = {
  // Auth & Users
  LOGIN: '/users/login',
  REGISTER: '/users/register',
  CHECK_UNIQUE: '/users/check-unique',
  SEND_CODE: '/users/send-code',
  ME: '/users/me',

  // Quizzes
  QUIZZES: '/quizzes',
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'viaquiz-token',
  LOCALE: 'viaquiz-locale',
} as const;
