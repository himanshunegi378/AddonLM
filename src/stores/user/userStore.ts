import { create } from "zustand";

type UserState = {
  name: string;
  id: number;
  setUser: (user: { id: number; name: string }) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  name: "John",
  id: 1,
  setUser: (user) => set({ name: user.name, id: user.id }),
  clearUser: () => set({ name: "", id: -1 }),
}));
