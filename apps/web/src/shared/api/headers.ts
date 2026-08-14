import { STORAGE_KEYS } from '../constants';

export function getAuthToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
}

export function removeAuthToken(): void {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
}

export function getAuthHeaders(headers: Headers = new Headers()): Headers {
  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}
