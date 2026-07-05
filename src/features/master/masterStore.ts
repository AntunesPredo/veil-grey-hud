import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomEffect, Item } from "../../shared/types/veil-grey";
import { arrayMove } from "@dnd-kit/sortable";
import type { CharacterStore } from "../character/store";

export type MasterFolder = {
  id: string;
  name: string;
  type: "ITEM" | "EFFECT";
};

export type MasterNpc = Partial<CharacterStore> & {
  id: string;
  name: string;
  isEnemy: boolean;
  isActive: boolean;
  type: "HUMAN" | "NON_HUMAN";
  folderId: string | null;
};

export type MasterItem = Item & {
  folderId: string | null;
};

export type MasterEffect = CustomEffect & {
  folderId: string | null;
};

interface MasterStore {
  folders: MasterFolder[];
  npcFolders: MasterFolder[];
  globalItems: MasterItem[];
  globalEffects: MasterEffect[];
  npcs: MasterNpc[];
  masterBackup: Partial<CharacterStore> | null;
  pendingOverrides: Record<string, Partial<CharacterStore>>;
  activeQuickActionNpcId: string | null;
  lastRestSettings: { temperature: number; comfort: number; difficulty: number } | null;

  setLastRestSettings: (settings: { temperature: number; comfort: number; difficulty: number } | null) => void;
  setActiveQuickActionNpcId: (id: string | null) => void;
  setMasterBackup: (data: Partial<CharacterStore> | null) => void;
  addPendingOverride: (playerName: string, data: Partial<CharacterStore>) => void;
  removePendingOverride: (playerName: string) => void;
  
  saveNpc: (npc: MasterNpc) => void;
  deleteNpc: (id: string) => void;
  toggleNpcActive: (id: string) => void;
  toggleFolderNpcsActive: (folderId: string, isActive: boolean) => void;
  updateNpcData: (id: string, data: Partial<MasterNpc>) => void;
  addNpcFolder: (folder: MasterFolder) => void;
  removeNpcFolder: (id: string) => void;
  reorderNpcFolders: (oldIndex: number, newIndex: number) => void;
  reorderNpcs: (activeId: string, overId: string) => void;
  moveNpcToFolder: (npcId: string, folderId: string | null) => void;

  addFolder: (folder: MasterFolder) => void;
  reorderFolders: (oldIndex: number, newIndex: number) => void;
  removeFolder: (id: string) => void;
  addGlobalItem: (item: MasterItem) => void;
  reorderGlobalItems: (activeId: string, overId: string) => void;
  reorderGlobalEffects: (activeId: number, overId: number) => void;
  removeGlobalItem: (id: string) => void;
  addGlobalEffect: (effect: MasterEffect) => void;
  removeGlobalEffect: (id: number) => void;
  moveItemToFolder: (itemId: string, folderId: string | null) => void;
  moveEffectToFolder: (effectId: number, folderId: string | null) => void;
  importArsenal: (data: Partial<MasterStore>) => void;
}

export const useMasterStore = create<MasterStore>()(
  persist(
    (set) => ({
      folders: [],
      npcFolders: [],
      globalItems: [],
      globalEffects: [],
      npcs: [],
      masterBackup: null,
      pendingOverrides: {},
      activeQuickActionNpcId: null,
      lastRestSettings: null,

      setLastRestSettings: (settings) => set({ lastRestSettings: settings }),
      setActiveQuickActionNpcId: (id) => set({ activeQuickActionNpcId: id }),
      setMasterBackup: (data) => set({ masterBackup: data }),
      addPendingOverride: (playerName, data) =>
        set((s) => ({
          pendingOverrides: { ...s.pendingOverrides, [playerName]: data },
        })),
      removePendingOverride: (playerName) =>
        set((s) => {
          const newOverrides = { ...s.pendingOverrides };
          delete newOverrides[playerName];
          return { pendingOverrides: newOverrides };
        }),
      saveNpc: (npc) => set((s) => ({ npcs: [...s.npcs, npc] })),
      deleteNpc: (id) =>
        set((s) => ({ npcs: s.npcs.filter((n) => n.id !== id) })),
      toggleNpcActive: (id) =>
        set((s) => ({
          npcs: s.npcs.map((n) =>
            n.id === id ? { ...n, isActive: !n.isActive } : n,
          ),
        })),
      toggleFolderNpcsActive: (folderId, isActive) =>
        set((s) => ({
          npcs: s.npcs.map((n) =>
            n.folderId === folderId ? { ...n, isActive } : n,
          ),
        })),
      updateNpcData: (id, data) =>
        set((s) => ({
          npcs: s.npcs.map((n) => (n.id === id ? { ...n, ...data } : n)),
        })),
      
      addNpcFolder: (folder) => set((s) => ({ npcFolders: [...s.npcFolders, folder] })),
      removeNpcFolder: (id) =>
        set((s) => ({
          npcFolders: s.npcFolders.filter((f) => f.id !== id),
          npcs: s.npcs.map((n) => (n.folderId === id ? { ...n, folderId: null } : n)),
        })),
      reorderNpcFolders: (oldIndex, newIndex) =>
        set((s) => ({
          npcFolders: arrayMove(s.npcFolders, oldIndex, newIndex),
        })),
      reorderNpcs: (activeId, overId) =>
        set((s) => {
          const oldIndex = s.npcs.findIndex((n) => n.id === activeId);
          const newIndex = s.npcs.findIndex((n) => n.id === overId);
          if (oldIndex === -1 || newIndex === -1) return s;
          const newNpcs = [...s.npcs];
          const [moved] = newNpcs.splice(oldIndex, 1);
          newNpcs.splice(newIndex, 0, moved);
          return { npcs: newNpcs };
        }),
      moveNpcToFolder: (npcId, folderId) =>
        set((s) => ({
          npcs: s.npcs.map((n) => (n.id === npcId ? { ...n, folderId } : n)),
        })),

      addFolder: (folder) => set((s) => ({ folders: [...s.folders, folder] })),
      reorderFolders: (oldIndex, newIndex) =>
        set((s) => ({
          folders: arrayMove(s.folders, oldIndex, newIndex),
        })),
      removeFolder: (id) =>
        set((s) => ({
          folders: s.folders.filter((f) => f.id !== id),
          globalItems: s.globalItems.map((i) =>
            i.folderId === id ? { ...i, folderId: null } : i,
          ),
          globalEffects: s.globalEffects.map((e) =>
            e.folderId === id ? { ...e, folderId: null } : e,
          ),
        })),
      addGlobalItem: (item) =>
        set((s) => ({ globalItems: [...s.globalItems, item] })),
      reorderGlobalItems: (activeId, overId) =>
        set((s) => {
          const oldIndex = s.globalItems.findIndex((i) => i.id === activeId);
          const newIndex = s.globalItems.findIndex((i) => i.id === overId);
          if (oldIndex === -1 || newIndex === -1) return s;
          const newItems = [...s.globalItems];
          const [moved] = newItems.splice(oldIndex, 1);
          newItems.splice(newIndex, 0, moved);
          return { globalItems: newItems };
        }),

      reorderGlobalEffects: (activeId, overId) =>
        set((s) => {
          const oldIndex = s.globalEffects.findIndex((e) => e.id === activeId);
          const newIndex = s.globalEffects.findIndex((e) => e.id === overId);
          if (oldIndex === -1 || newIndex === -1) return s;
          const newEffects = [...s.globalEffects];
          const [moved] = newEffects.splice(oldIndex, 1);
          newEffects.splice(newIndex, 0, moved);
          return { globalEffects: newEffects };
        }),
      removeGlobalItem: (id) =>
        set((s) => ({ globalItems: s.globalItems.filter((i) => i.id !== id) })),
      addGlobalEffect: (effect) =>
        set((s) => ({ globalEffects: [...s.globalEffects, effect] })),
      removeGlobalEffect: (id) =>
        set((s) => ({
          globalEffects: s.globalEffects.filter((e) => e.id !== id),
        })),
      moveItemToFolder: (itemId, folderId) =>
        set((s) => ({
          globalItems: s.globalItems.map((i) =>
            i.id === itemId ? { ...i, folderId } : i,
          ),
        })),
      moveEffectToFolder: (effectId, folderId) =>
        set((s) => ({
          globalEffects: s.globalEffects.map((e) =>
            e.id === effectId ? { ...e, folderId } : e,
          ),
        })),
      importArsenal: (data) => set((s) => ({ ...s, ...data })),
    }),
    { name: "vg_master_data" },
  ),
);
