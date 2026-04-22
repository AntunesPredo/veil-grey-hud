import type { StateCreator } from "zustand";
import type { CharacterStore } from "../character/store";
import type { EnergyLevel, CrisisState } from "../../shared/types/veil-grey";

export interface VitalsSlice {
  hp: {
    current: number;
    temp: number;
    isInjured: boolean;
    isVeryInjured: boolean;
    autoApplyInjury: boolean;
  };
  sustenance: { current: number };
  insanity: {
    current: number;
    volatile: boolean;
  };
  energy: EnergyLevel;
  evilness: number;
  crisis: { state: CrisisState; fails: number; ignore: boolean };

  updateHp: (amount: number) => void;
  updateHpTemp: (amount: number) => void;
  updateInsanity: (current: number) => void;
  updateSustenance: (current: number) => void;
  updateEnergy: (energy: EnergyLevel) => void;
  updateEvilness: (val: number) => void;
  updateCrisis: (data: Partial<VitalsSlice["crisis"]>) => void;
  setManualInjury: (type: "isInjured" | "isVeryInjured", val: boolean) => void;
  toggleAutoInjury: () => void;
  toggleVolatilePsyche: () => void;
}

export const createVitalsSlice: StateCreator<
  CharacterStore,
  [],
  [],
  VitalsSlice
> = (set) => ({
  hp: {
    current: 65,
    temp: 0,
    isInjured: false,
    isVeryInjured: false,
    autoApplyInjury: true,
  },
  sustenance: { current: 0 },
  insanity: { current: 0, volatile: false },
  energy: "rested",
  evilness: 0,
  crisis: { state: null, fails: 0, ignore: false },

  updateHp: (amount) =>
    set((state) => ({ hp: { ...state.hp, current: amount } })),
  updateHpTemp: (amount) =>
    set((state) => ({ hp: { ...state.hp, temp: Math.max(0, amount) } })),
  updateInsanity: (current) =>
    set((state) => ({ insanity: { ...state.insanity, current } })),
  updateSustenance: (current) =>
    set((state) => ({ sustenance: { ...state.sustenance, current } })),
  updateEnergy: (energy) => set({ energy }),
  updateEvilness: (val) => set({ evilness: val }),
  updateCrisis: (data) =>
    set((state) => ({ crisis: { ...state.crisis, ...data } })),
  setManualInjury: (type, val) =>
    set((state) => ({ hp: { ...state.hp, [type]: val } })),
  toggleAutoInjury: () =>
    set((state) => ({
      hp: { ...state.hp, autoApplyInjury: !state.hp.autoApplyInjury },
    })),
  toggleVolatilePsyche: () =>
    set((state) => ({
      insanity: { ...state.insanity, volatile: !state.insanity.volatile },
    })),
});
