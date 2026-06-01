import { create } from "zustand";

interface EventStatusState {
  status: string;
  setStatus: (s: string) => void;
}

export const useEventStatus = create<EventStatusState>((set) => ({
  status: "",
  setStatus: (s) => set({ status: s }),
}));
