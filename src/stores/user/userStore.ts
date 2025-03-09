import { create } from "zustand";

type UserState = {
  name: string;
  id: number;
  apiKey?: string;
  setUser: (user: { id: number; name: string }) => void;
  clearUser: () => void;
  setApiKey: (apiKey: string) => void;
};

export const useUserStore = create<UserState>((set) => ({
  name: "John",
  id: 1,
  apiKey: undefined,
  setUser: (user) => set({ name: user.name, id: user.id }),
  clearUser: () => set({ name: "", id: -1, apiKey: undefined }),
  setApiKey: (apiKey) => set({ apiKey }),
}));
