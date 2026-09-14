import { apiClient } from "./apiClient";
import type { RegisterInput, LoginInput, User } from "../types/auth";

export interface AuthApiResponse {
  user: User;
  accessToken: string;
}

export async function registerApi(input: RegisterInput) {
  return apiClient<AuthApiResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function loginApi(input: LoginInput) {
  return apiClient<AuthApiResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function refreshApi() {
  return apiClient<{ accessToken: string }>("/auth/refresh", {
    method: "POST",
    retryOn401: false,
  });
}

export async function logoutApi() {
  return apiClient<null>("/auth/logout", {
    method: "POST",
    retryOn401: false,
  });
}

export async function getMeApi() {
  return apiClient<{ user: User }>("/auth/me", {
    method: "GET",
  });
}
