import { create } from "zustand";

interface EventStatusState {
  lastEvent: string;
  selected: string | null;
  setLastEvent: (s: string) => void;
  setSelected: (s: string | null) => void;
}

export const useEventStatus = create<EventStatusState>((set) => ({
  lastEvent: "",
  selected: null,
  setLastEvent: (s) => set({ lastEvent: s }),
  setSelected: (s) => set({ selected: s }),
}));
