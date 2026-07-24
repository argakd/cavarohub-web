import { api } from "./client";
import { AuthUser, Role } from "@/types";

export type AuthResponse = { token: string; user: AuthUser };

export async function register(input: {
  name: string;
  email: string;
  password: string;
  role: Role;
  referralCode?: string;
}) {
  const { data } = await api.post<AuthResponse>("/api/auth/register", input);
  return data;
}

export async function login(input: { email: string; password: string }) {
  const { data } = await api.post<AuthResponse>("/api/auth/login", input);
  return data;
}

export async function getMe() {
  const { data } = await api.get<AuthUser>("/api/auth/me");
  return data;
}

export async function updateProfile(input: { name?: string; profilePicture?: string }) {
  const { data } = await api.patch<AuthUser>("/api/auth/me", input);
  return data;
}

export async function changePassword(input: { currentPassword: string; newPassword: string }) {
  await api.post("/api/auth/change-password", input);
}

export async function forgotPassword(email: string) {
  const { data } = await api.post<{ message: string; devResetUrl?: string }>("/api/auth/forgot-password", { email });
  return data;
}

export async function resetPassword(input: { token: string; newPassword: string }) {
  await api.post("/api/auth/reset-password", input);
}
