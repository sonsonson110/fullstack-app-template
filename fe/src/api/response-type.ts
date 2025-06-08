import axios from "axios";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: { field: string; message: string }[];
  error?: string;
}

export function getServerErrorMessage (
  error: unknown,
  fallback: string = "Failed to fetch"
): string {
  return axios.isAxiosError(error)
    ? error.response?.data.message || fallback
    : fallback;
};
