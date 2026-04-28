import { create } from "zustand";

export type VitalsMode = "DAMAGE" | "HEALING";
export type InsanityMode = "ADD" | "SUB";
export type DefenseData = {
  attackRoll: number;
  damage: number;
  defenseType: "DODGE" | "BLOCK";
  attackerName: string;
} | null;

interface VitalsStore {
  isOpen: boolean;
  mode: VitalsMode;
  inputValue: string;
  isSystemInjection: boolean;
  openModal: (
    mode: VitalsMode,
    initialValue?: string,
    isSystem?: boolean,
  ) => void;
  setInputValue: (val: string) => void;
  closeModal: () => void;

  isInsanityOpen: boolean;
  insanityMode: InsanityMode | null;
  insanityInputValue: string;
  isInsanitySystemInjection: boolean;
  openInsanityModal: (
    mode: InsanityMode,
    initialValue?: string,
    isSystem?: boolean,
  ) => void;
  setInsanityInputValue: (val: string) => void;
  closeInsanityModal: () => void;

  isDefenseOpen: boolean;
  defenseData: DefenseData;
  openDefenseModal: (data: NonNullable<DefenseData>) => void;
  closeDefenseModal: () => void;
}

export const useVitalsStore = create<VitalsStore>((set) => ({
  isOpen: false,
  mode: "DAMAGE",
  inputValue: "",
  isSystemInjection: false,
  openModal: (mode, initialValue = "", isSystem = false) =>
    set({
      isOpen: true,
      mode,
      inputValue: initialValue,
      isSystemInjection: isSystem,
    }),
  setInputValue: (val) => set({ inputValue: val }),
  closeModal: () => set({ isOpen: false, isSystemInjection: false }),

  isInsanityOpen: false,
  insanityMode: null,
  insanityInputValue: "",
  isInsanitySystemInjection: false,
  openInsanityModal: (mode, initialValue = "", isSystem = false) =>
    set({
      isInsanityOpen: true,
      insanityMode: mode,
      insanityInputValue: initialValue,
      isInsanitySystemInjection: isSystem,
    }),
  setInsanityInputValue: (val) => set({ insanityInputValue: val }),
  closeInsanityModal: () =>
    set({ isInsanityOpen: false, isInsanitySystemInjection: false }),

  isDefenseOpen: false,
  defenseData: null,
  openDefenseModal: (data) => set({ isDefenseOpen: true, defenseData: data }),
  closeDefenseModal: () => set({ isDefenseOpen: false, defenseData: null }),
}));
