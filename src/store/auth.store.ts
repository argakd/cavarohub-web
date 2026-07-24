import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthUser } from "@/types";

type StoredAuth = { token: string; user: AuthUser };

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  signIn: (auth: StoredAuth) => void;
  signOut: () => void;
  updateUser: (user: AuthUser) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      signIn: ({ token, user }) => set({ token, user }),
      signOut: () => set({ token: null, user: null }),
      updateUser: (user) => set({ user }),
    }),
    { name: "auth" },
  ),
);

export function getStoredToken(): string | null {
  return useAuthStore.getState().token;
}
