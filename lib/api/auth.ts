import { AuthResponse, LoginFormData, UserRole } from "@/app/types/auth.type";
import { clientApi } from "./config";
import { storeToken } from "../jwt";
import { ClientCookies } from "../cookies";

export async function login(info: LoginFormData): Promise<AuthResponse> {
  const response = await clientApi.post<AuthResponse>("/auth/login", info);
  const { user, accessToken } = response.data;

  console.log("user", user);
  console.log("token", accessToken);

  // Store token in regular cookie with synchronized expiration
  storeToken(accessToken);

  return response.data;
}

export async function logout(): Promise<void> {
  // Clear the cookie
  ClientCookies.remove();
}

// Password Reset Functions
export async function requestPasswordReset(email: string, role: UserRole): Promise<void> {
  await clientApi.post("/auth/forgot-password", { email, role });
}

export async function verifyResetToken(token: string, email: string, role: UserRole): Promise<void> {
  await clientApi.post("/auth/verify-reset-token", { token, email, role });
}

export async function resetPassword(token: string, newPassword: string, email: string, role: UserRole): Promise<void> {
  await clientApi.post("/auth/reset-password", { token, newPassword, email, role });
}
