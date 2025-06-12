import type { ApiResponse } from "@/api/response-type";
import apiClient from "@/lib/api-client";
import type { QueryParams } from "@/types/pagination-query-params";
import type { UserListItem } from "@/types/user";

export const userApi = {
  getUsers: async (
    params: QueryParams
  ): Promise<ApiResponse<UserListItem>> => {
    const response = await apiClient.get("/users", { params });
    return response.data;
  },
};
