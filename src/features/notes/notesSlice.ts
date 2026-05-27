import type { StateCreator } from "zustand";
import type { CharacterStore } from "../character/store";
import type { CustomEffect, Note } from "../../shared/types/veil-grey";

export interface NotesSlice {
  notes: Note[];
  mainNote: string;
  isMainNoteEditing: boolean;
  mainNoteHeight: number;

  updateMainNote: (content: string) => void;
  addNote: () => void;
  updateNote: (
    id: string,
    field: "title" | "content" | "imageUrl",
    val: string,
  ) => void;
  deleteNote: (id: string) => void;
  toggleNoteEditMode: (id: string | "MAIN") => void;
  updateNoteHeight: (id: string | "MAIN", height: number) => void;
  importExternalNote: (note: Note, effects: CustomEffect[]) => void;
  reorderNotes: (activeId: string, overId: string) => void;
}

export const createNotesSlice: StateCreator<
  CharacterStore,
  [],
  [],
  NotesSlice
> = (set) => ({
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
          id: crypto.randomUUID(),
          title: "Nova Nota",
          content: "",
          isEditing: true,
          height: 200,
          imageUrl: "",
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
  importExternalNote: (note, effects) =>
    set((state) => {
      const newNoteId = crypto.randomUUID();
      const newNote = { ...note, id: newNoteId, isEditing: false };
      const newEffects = effects.map((e) => ({
        ...e,
        id: Date.now() + Math.random(),
        link: newNoteId,
      }));

      return {
        notes: [...state.notes, newNote],
        customEffects: [...state.customEffects, ...newEffects],
      };
    }),
  reorderNotes: (activeId, overId) => {
    set((state) => {
      const oldIdx = state.notes.findIndex((n) => n.id === activeId);
      const newIdx = state.notes.findIndex((n) => n.id === overId);
      if (oldIdx === -1 || newIdx === -1) return state;
      const newNotes = [...state.notes];
      const [moved] = newNotes.splice(oldIdx, 1);
      newNotes.splice(newIdx, 0, moved);
      return { notes: newNotes };
    });
  },
});
