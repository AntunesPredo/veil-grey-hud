import { create } from "zustand";
import type { GameEvent } from "../../../shared/types/events";

interface EventsStore {
  activeEvents: GameEvent[];
  addEvent: (event: GameEvent) => void;
  removeEvent: (eventId: string) => void;
  updateEvent: (eventId: string, data: Partial<GameEvent>) => void;
  setEvents: (events: GameEvent[]) => void;
}

export const useEventsStore = create<EventsStore>((set) => ({
  activeEvents: [],
  addEvent: (event) =>
    set((state) => ({ activeEvents: [...state.activeEvents, event] })),
  removeEvent: (eventId) =>
    set((state) => ({
      activeEvents: state.activeEvents.filter((e) => e.id !== eventId),
    })),
  updateEvent: (eventId, data) =>
    set((state) => ({
      activeEvents: state.activeEvents.map((e) =>
        e.id === eventId ? { ...e, ...data } as GameEvent : e
      ),
    })),
  setEvents: (events) => set({ activeEvents: events }),
}));
