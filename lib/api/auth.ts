import { AuthResponse, LoginFormData, UserRole, AuthUser } from "@/app/types/auth.type";
import { clientApi, createServerApi } from "./config";

export async function login(info: LoginFormData): Promise<AuthResponse> {
  const response = await clientApi.post<AuthResponse>("/auth/login", info);

  if (process.env.NODE_ENV !== "production") {
    console.log("user", response.data.user);
    console.log("token", "[TOKEN RECEIVED - stored in HttpOnly cookie by backend]");
  }

  // Backend sets HttpOnly cookie automatically
  // No client-side token storage needed
  return response.data;
}

// Get current user from backend (using HttpOnly cookie)
export async function getCurrentUser(): Promise<AuthUser> {
  const response = await clientApi.get<AuthUser>("/auth/me");
  return response.data;
}

// Get current user server-side with explicit token
export async function getServerCurrentUser(accessToken?: string): Promise<AuthUser> {
  const api = await createServerApi(accessToken);
  const response = await api.get<AuthUser>("/auth/me");
  return response.data;
}

export async function logout(): Promise<void> {
  // Call backend to clear HttpOnly cookie
  await clientApi.post("/auth/logout");
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
