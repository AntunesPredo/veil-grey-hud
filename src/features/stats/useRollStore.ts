import { create } from "zustand";
import type { CustomEffect } from "../../shared/types/veil-grey";
import type { ParseResult } from "../../shared/utils/diceEngine";

export type RollStep = "STANDBY" | "CONFIGURING" | "RESOLVED";

interface RollPayload {
  title: string;
  baseExpression: string; // Ex: 1d20+4
  dc?: number;
  fixedEffects: CustomEffect[];
  optionalEffects: CustomEffect[];
  resolveAsToast: boolean;
}

interface RollStore {
  step: RollStep;
  payload: RollPayload | null;
  selectedOptionals: CustomEffect[];
  result: ParseResult | null;

  openConfig: (payload: RollPayload) => void;
  toggleOptional: (effect: CustomEffect) => void;
  setResult: (result: ParseResult) => void;
  close: () => void;
}

export const useRollStore = create<RollStore>((set) => ({
  step: "STANDBY",
  payload: null,
  selectedOptionals: [],
  result: null,

  openConfig: (payload) =>
    set({
      step: "CONFIGURING",
      payload,
      selectedOptionals: [],
      result: null,
    }),

  toggleOptional: (effect) =>
    set((state) => {
      const exists = state.selectedOptionals.find((e) => e.id === effect.id);
      if (exists) {
        return {
          selectedOptionals: state.selectedOptionals.filter(
            (e) => e.id !== effect.id,
          ),
        };
      }
      return { selectedOptionals: [...state.selectedOptionals, effect] };
    }),

  setResult: (result) => set({ result, step: "RESOLVED" }),

  close: () =>
    set({
      step: "STANDBY",
      payload: null,
      selectedOptionals: [],
      result: null,
    }),
}));
