import { AuthResponse, LoginFormData, UserRole, AuthUser } from "@/app/types/auth.type";
import { clientApi } from "./config";
import { storeToken } from "../jwt";
import { ClientCookies } from "../cookies";

export async function login(info: LoginFormData): Promise<AuthResponse> {
  const response = await clientApi.post<AuthResponse>("/auth/login", info);
  const { user, accessToken } = response.data;

  if (process.env.NODE_ENV !== "production") {
    console.log("user", user);
    console.log("token", "[TOKEN RECEIVED]");
  }

  // Token is now also in HttpOnly cookie (set by backend)
  // Still storing for backward compatibility during migration
  storeToken(accessToken);

  return response.data;
}

// Get current user from backend (using HttpOnly cookie)
export async function getCurrentUser(): Promise<AuthUser> {
  const response = await clientApi.get<AuthUser>("/auth/me");
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
