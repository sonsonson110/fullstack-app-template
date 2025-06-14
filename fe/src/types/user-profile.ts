import type { Role } from "@/types/enums";

export type UserProfile = {
  id: string;
  username: string;
  email: string;
  role: Role;
};
