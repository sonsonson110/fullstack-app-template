import type { UserStatus } from "@/types/enums";

export type UserListItem = {
  id: string;
  username: string;
  email: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};