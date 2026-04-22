import { create } from "zustand";

export type VitalsMode = "DAMAGE" | "HEALING";

interface VitalsStore {
  isOpen: boolean;
  mode: VitalsMode;
  inputValue: string;
  openModal: (mode: VitalsMode) => void;
  setInputValue: (val: string) => void;
  closeModal: () => void;
}

export const useVitalsStore = create<VitalsStore>((set) => ({
  isOpen: false,
  mode: "DAMAGE",
  inputValue: "",
  openModal: (mode) => set({ isOpen: true, mode, inputValue: "" }),
  setInputValue: (val) => set({ inputValue: val }),
  closeModal: () => set({ isOpen: false }),
}));
