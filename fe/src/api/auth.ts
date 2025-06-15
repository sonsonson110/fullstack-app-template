import type { ApiResponse } from "@/api/response-type";
import apiClient from "@/lib/api-client";
import type { ForgotPasswordDto } from "@/schemas/forgot-password.schema";
import type { LoginDto } from "@/schemas/login.schema";
import type { ResetPasswordDto } from "@/schemas/reset-password.schema";
import type { Role } from "@/types/enums";
import type { UserProfile } from "@/types/user-profile";
import axios from "axios";

export const authApi = {
  getCurrentUser: async (): Promise<ApiResponse<UserProfile>> => {
    const response = await apiClient.get<ApiResponse<UserProfile>>("/users/me");
    return response.data;
  },
  login: async (dto: LoginDto): Promise<ApiResponse<{ role: Role }>> => {
    const response = await apiClient.post<ApiResponse<{ role: Role }>>(
      "/auth/login",
      dto
    );
    return response.data;
  },
  logout: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>("/auth/logout");
    return response.data;
  },
  forgotPassword: async (dto: ForgotPasswordDto) => {
    const response = await apiClient.post<ApiResponse<null>>(
      "/auth/forgot-password",
      dto
    );
    return response.data;
  },
  resetPassword: async (dto: ResetPasswordDto) => {
    const response = await apiClient.post<ApiResponse<null>>(
      "/auth/reset-password",
      dto
    );
    return response.data;
  },
  verifyResetToken: async (resetToken: string) => {
    const response = await apiClient.get<ApiResponse<null>>(
      `/auth/reset-password/verify/${resetToken}`
    );
    return response.data;
  },
  refreshToken: async () => {
    // Do not use apiClient here to avoid circular dependency issues
    const response = await axios.post<ApiResponse<null>>(
      `${process.env.VITE_API_URL}/auth/refresh-token`
    );
    return response.data;
  },
};
