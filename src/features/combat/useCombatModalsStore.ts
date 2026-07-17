import { create } from "zustand";

export interface AttackResultData {
  weaponId: string;
  weaponName: string;
  weaponType: "MELEE" | "FIREARM" | "RANGED" | "NONE";
  weaponCondition: number;
  attackRoll: number;
  isCrit: boolean;
  isFail: boolean;
  finalDamage: number;
  isSuccess: boolean;
  rollLog: string;
  targetName: string;
  attackerName: string;
}

interface CombatModalsStore {
  attackResult: AttackResultData | null;
  openAttackResult: (data: AttackResultData) => void;
  closeAttackResult: () => void;
}

export const useCombatModalsStore = create<CombatModalsStore>((set) => ({
  attackResult: null,
  openAttackResult: (data) => set({ attackResult: data }),
  closeAttackResult: () => set({ attackResult: null }),
}));
