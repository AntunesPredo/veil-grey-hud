import type { StateCreator } from "zustand";
import type { CharacterStore } from "../character/store";
import type { EnergyLevel, CrisisState } from "../../shared/types/veil-grey";

export interface VitalsSlice {
  hp: {
    current: number;
    baseMax: number;
    temp: number;
    maxBonus: number;
    isInjured: boolean;
    isVeryInjured: boolean;
    autoApplyInjury: boolean;
  };
  sustenance: { current: number };
  insanity: { current: number; volatile: boolean };
  energy: EnergyLevel;
  evilness: number;
  crisis: { state: CrisisState; fails: number; ignore: boolean };

  applyHealing: (amount: number, maxHp: number) => void;
  applyDamage: (
    amount: number,
    mitigateMode: "FULL" | "HALF" | "IGNORE",
    armorId: number | null,
    maxHp: number,
  ) => void;

  updateHpTemp: (amount: number) => void;
  addMaxHpBonus: (amount: number) => void;
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
> = (set, get) => ({
  hp: {
    current: 65,
    baseMax: 0,
    temp: 0,
    maxBonus: 0,
    isInjured: false,
    isVeryInjured: false,
    autoApplyInjury: true,
  },
  sustenance: { current: 0 },
  insanity: { current: 0, volatile: false },
  energy: "rested",
  evilness: 0,
  crisis: { state: null, fails: 0, ignore: false },

  applyHealing: (amount, maxHp) =>
    set((state) => ({
      hp: { ...state.hp, current: Math.min(maxHp, state.hp.current + amount) },
    })),

  addMaxHpBonus: (amount) =>
    set((state) => ({
      hp: {
        ...state.hp,
        maxBonus: state.hp.maxBonus + amount,
        current: state.hp.current + amount,
      },
    })),

  applyDamage: (amount, mitigateMode, armorId, maxHp) => {
    const state = get();
    let finalDamage = amount;

    if (mitigateMode !== "IGNORE" && armorId) {
      const armor = state.inventory.find((i) => i.id === armorId);
      if (armor && "armorProps" in armor && armor.armorProps) {
        let rd = armor.armorProps.rd;
        if (mitigateMode === "HALF") rd = Math.floor(rd / 2);

        const effectiveBlock = Math.min(finalDamage, rd, armor.armorProps.pe);
        finalDamage -= effectiveBlock;

        state.updateInventoryItem(armorId, "armorProps", {
          ...armor.armorProps,
          pe: armor.armorProps.pe - effectiveBlock,
        });
      }
    }

    set((s) => {
      let remainingDamage = finalDamage;
      let newTemp = s.hp.temp;
      let newCurrent = Math.min(s.hp.current, maxHp);

      if (newTemp > 0) {
        if (newTemp >= remainingDamage) {
          newTemp -= remainingDamage;
          remainingDamage = 0;
        } else {
          remainingDamage -= newTemp;
          newTemp = 0;
        }
      }

      if (remainingDamage > 0) {
        newCurrent = Math.max(0, newCurrent - remainingDamage);
      }

      return { hp: { ...s.hp, temp: newTemp, current: newCurrent } };
    });
  },

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
    set((state) => {
      const update =
        type === "isInjured"
          ? { ...state.hp, isInjured: val, isVeryInjured: false }
          : { ...state.hp, isVeryInjured: val, isInjured: false };

      return { hp: update };
    }),
  toggleAutoInjury: () =>
    set((state) => ({
      hp: { ...state.hp, autoApplyInjury: !state.hp.autoApplyInjury },
    })),
  toggleVolatilePsyche: () =>
    set((state) => ({
      insanity: { ...state.insanity, volatile: !state.insanity.volatile },
    })),
});
