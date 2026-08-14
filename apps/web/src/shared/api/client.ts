const BASE_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";

const TOKEN_KEY = "viaquiz-token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  public status: number;
  public details?: Record<string, unknown>;

  constructor(message: string, status: number, details?: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers = new Headers(options?.headers || {});
  
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    let errorDetails: Record<string, unknown> | undefined;
    try {
      const errorBody = await response.json();
      if (errorBody.message) {
        errorMessage = errorBody.message;
      }
      if (errorBody.details) {
        errorDetails = errorBody.details;
      }
    } catch {
      // Failed to parse JSON error body
    }
    throw new ApiError(errorMessage, response.status, errorDetails);
  }

  // Handle empty responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// User API Types
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

export interface RegisterData {
  login: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  code: string;
}

export interface AuthResult {
  token: string;
  user: Record<string, unknown>;
}

export interface LoginData {
  email: string;
  password: string;
}

// Named API functions (used by pages)
export function apiCheckUnique(data: CheckUniqueData) {
  return apiFetch<CheckUniqueResult>("/api/users/check-unique", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function apiSendCode(data: SendCodeData) {
  return apiFetch<SendCodeResult>("/api/users/send-code", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function apiRegister(data: RegisterData) {
  return apiFetch<AuthResult>("/api/users/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function apiLogin(data: LoginData) {
  return apiFetch<AuthResult>("/api/users/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function apiMe() {
  return apiFetch<Record<string, unknown>>("/api/users/me", {
    method: "GET",
  });
}
