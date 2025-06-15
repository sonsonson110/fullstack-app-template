import { authApi } from "@/api/auth";
import type { UserProfile } from "@/types/user-profile";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createContext, useContext } from "react";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const { data, error, status } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: authApi.getCurrentUser,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      queryClient.clear();
    }
  };

  const refetchUser = () => {
    return queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
  };

  return (
    <AuthContext.Provider
      value={{
        user: data?.data ?? null,
        isLoading: status === "success" || status === "error",
        error,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
