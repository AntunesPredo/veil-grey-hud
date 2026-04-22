import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  createProgressionSlice,
  type ProgressionSlice,
} from "../progression/progressionSlice";
import { createStatsSlice, type StatsSlice } from "../stats/statsSlice";
import { createVitalsSlice, type VitalsSlice } from "../vitals/vitalsSlice";
import {
  createInventorySlice,
  type InventorySlice,
} from "../inventory/inventorySlice";
import { createNotesSlice, type NotesSlice } from "../notes/notesSlice";

export type CharacterStore = ProgressionSlice &
  StatsSlice &
  VitalsSlice &
  InventorySlice &
  NotesSlice & {
    resetCharacterData: () => void;
    importCharacterData: (data: Partial<CharacterStore>) => void;
  };

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (...a) => {
      const [set] = a;

      return {
        ...createProgressionSlice(...a),
        ...createStatsSlice(...a),
        ...createVitalsSlice(...a),
        ...createInventorySlice(...a),
        ...createNotesSlice(...a),

        importCharacterData: (data) => {
          set((state) => ({ ...state, ...data }));
        },

        resetCharacterData: () => {
          const emptyState = {
            ...createProgressionSlice(...a),
            ...createStatsSlice(...a),
            ...createVitalsSlice(...a),
            ...createInventorySlice(...a),
            ...createNotesSlice(...a),
          };
          set(emptyState);
        },
      };
    },
    {
      name: "vg_character_data",
      partialize: (state) => ({
        ...state,
        crisis: { ...state.crisis, ignore: false },
      }),
    },
  ),
);
