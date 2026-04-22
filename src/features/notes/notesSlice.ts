import type { StateCreator } from "zustand";
import type { CharacterStore } from "../character/store";
import type { Note } from "../../shared/types/veil-grey";

export interface NotesSlice {
  notes: Note[];
  mainNote: string;
  isMainNoteEditing: boolean;
  mainNoteHeight: number;

  updateMainNote: (content: string) => void;
  addNote: () => void;
  updateNote: (id: number, field: "title" | "content", val: string) => void;
  deleteNote: (id: number) => void;
  toggleNoteEditMode: (id: number | "MAIN") => void;
  updateNoteHeight: (id: number | "MAIN", height: number) => void;
}

export const createNotesSlice: StateCreator<
  CharacterStore,
  [],
  [],
  NotesSlice
> = (set, get) => ({
  notes: [],
  mainNote: "# Nota principal",
  isMainNoteEditing: false,
  mainNoteHeight: 200,

  updateMainNote: (content) => set({ mainNote: content }),
  addNote: () =>
    set((state) => ({
      notes: [
        ...state.notes,
        {
          id: Date.now(),
          title: "Nova Nota",
          content: "",
          isEditing: true,
          height: 200,
        },
      ],
    })),
  updateNote: (id, field, val) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, [field]: val } : n)),
    })),
  deleteNote: (id) => {
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      customEffects: state.customEffects.filter((e) => e.link !== id),
    }));
    get().recalculateAll();
  },

  toggleNoteEditMode: (id) => {
    if (id === "MAIN")
      set((state) => ({ isMainNoteEditing: !state.isMainNoteEditing }));
    else
      set((state) => ({
        notes: state.notes.map((n) =>
          n.id === id ? { ...n, isEditing: !n.isEditing } : n,
        ),
      }));
  },
  updateNoteHeight: (id, height) => {
    if (id === "MAIN") set({ mainNoteHeight: height });
    else
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? { ...n, height } : n)),
      }));
  },
});
