import { useUserStore } from "./userStore";

export const useUser = () => useUserStore((state) => state);