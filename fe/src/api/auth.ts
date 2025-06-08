import type { ApiResponse } from "@/api/response-type";
import apiClient from "@/lib/api-client";
import type { ForgotPasswordDto } from "@/schemas/forgot-password.schema";
import type { LoginDto } from "@/schemas/login.schema";
import type { ResetPasswordDto } from "@/schemas/reset-password.schema";
import type { Role } from "@/types/enums";

export const authApi = {
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
};
