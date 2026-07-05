import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameEvent, EventLogEntry } from "../../../shared/types/events";

interface MasterEventsStore {
  masterEvents: GameEvent[];
  logs: EventLogEntry[];
  addEvent: (event: GameEvent) => void;
  removeEvent: (eventId: string) => void;
  updateEvent: (eventId: string, data: Partial<GameEvent>) => void;
  setEvents: (events: GameEvent[]) => void;
  exportEvents: () => string;
  importEvents: (json: string) => void;
  addLog: (log: Omit<EventLogEntry, "id" | "timestamp">) => void;
  clearLogs: () => void;
}

export const useMasterEventsStore = create<MasterEventsStore>()(
  persist(
    (set, get) => ({
      masterEvents: [],
      logs: [],
      addLog: (log) =>
        set((state) => ({
          logs: [
            ...state.logs,
            { ...log, id: crypto.randomUUID(), timestamp: Date.now() },
          ],
        })),
      clearLogs: () => set({ logs: [] }),
      addEvent: (event) =>
        set((state) => ({ masterEvents: [...state.masterEvents, event] })),
      removeEvent: (eventId) =>
        set((state) => ({
          masterEvents: state.masterEvents.filter((e) => e.id !== eventId),
        })),
      updateEvent: (eventId, data) =>
        set((state) => ({
          masterEvents: state.masterEvents.map((e) =>
            e.id === eventId ? ({ ...e, ...data } as GameEvent) : e
          ),
        })),
      setEvents: (events) => set({ masterEvents: events }),
      exportEvents: () => JSON.stringify(get().masterEvents),
      importEvents: (json: string) => {
        try {
          const parsed = JSON.parse(json);
          if (Array.isArray(parsed)) {
            set({ masterEvents: parsed });
          }
        } catch (e) {
          console.error("Failed to import events", e);
        }
      },
    }),
    {
      name: "vg_master_events_data",
    }
  )
);
