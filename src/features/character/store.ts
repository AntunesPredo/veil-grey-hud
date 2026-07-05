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
import { migrateCharacterToV2 } from "../../shared/utils/migration";

const APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.0";

export type CharacterStore = ProgressionSlice &
  StatsSlice &
  VitalsSlice &
  InventorySlice &
  NotesSlice & {
    appVersion: string;
    isOutdatedSave: boolean;
    npcType?: "HUMAN" | "NON_HUMAN";
    setOutdatedSave: (val: boolean) => void;
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

        appVersion: APP_VERSION,
        isOutdatedSave: false,

        setOutdatedSave: (val) => set({ isOutdatedSave: val }),

        importCharacterData: (data) => {
          set((state) => ({
            ...state,
            ...data,
            isOutdatedSave: false,
            appVersion: APP_VERSION,
          }));
        },

        resetCharacterData: () => {
          const emptyState = {
            ...createProgressionSlice(...a),
            ...createStatsSlice(...a),
            ...createVitalsSlice(...a),
            ...createInventorySlice(...a),
            ...createNotesSlice(...a),
            appVersion: APP_VERSION,
            isOutdatedSave: false,
          };
          set(emptyState);
        },
      };
    },
    {
      name: "vg_character_data",
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version < 1) {
          return migrateCharacterToV2(persistedState);
        }
        return persistedState;
      },
      onRehydrateStorage: () => {
        return (state, error) => {
          if (!error && state) {
            if (state.appVersion !== APP_VERSION) {
              state.setOutdatedSave(true);
            } else {
              state.setOutdatedSave(false);
            }
          }
        };
      },
      partialize: (state) => ({
        ...state,
        crisis: { ...state.crisis, ignore: false },
        isOutdatedSave: undefined,
      }),
    },
  ),
);

export function extractCharacterData(store: CharacterStore): Partial<CharacterStore> {
  const {
    attributes,
    skills,
    evilness,
    name,
    level,
    xp,
    creationStatus,
    freePoints,
    disadvantages,
    hp,
    insanity,
    energy,
    sustenance,
    crisis,
    inventory,
    customEffects,
    notes,
    mainNote,
    mainNoteHeight,
    role,
    settings,
    sandboxMode,
    isMasterMode,
    usedInjectIds,
    lockedSnapshot,
    isPossessing,
    npcType,
  } = store;

  return {
    attributes,
    skills,
    evilness,
    name,
    level,
    xp,
    creationStatus,
    freePoints,
    disadvantages,
    hp,
    insanity,
    energy,
    sustenance,
    crisis,
    inventory,
    customEffects,
    notes,
    mainNote,
    mainNoteHeight,
    role,
    settings,
    sandboxMode,
    isMasterMode,
    usedInjectIds,
    lockedSnapshot,
    isPossessing,
    npcType,
  };
}

export function getBlankCharacterData(): Partial<CharacterStore> {
  const dummySet = () => {};
  const dummyGet = () => ({} as any);
  const dummyStore = {} as any;
  const a: [any, any, any] = [dummySet, dummyGet, dummyStore];
  
  const emptyState = {
    ...createProgressionSlice(...a),
    ...createStatsSlice(...a),
    ...createVitalsSlice(...a),
    ...createInventorySlice(...a),
    ...createNotesSlice(...a),
  };
  return extractCharacterData(emptyState as CharacterStore);
}
