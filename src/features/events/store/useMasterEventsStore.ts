import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameEvent, EventLogEntry } from "../../../shared/types/events";
import { useVitalsStore } from "../../vitals/useVitalsStore";
import { useNetworkStore } from "../../../shared/store/useNetworkStore";

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
          masterEvents: state.masterEvents.map((e) => {
            if (e.id !== eventId) return e;

            if (e.type === "COMBAT" && data.type === "COMBAT") {
              const oldPayload = e.payload as any;
              const newPayload = data.payload as any;

              if (oldPayload?.participants && newPayload?.participants) {
                const mergedParticipants = { ...newPayload.participants };
                
                for (const key in oldPayload.participants) {
                  if (mergedParticipants[key]) {
                    const oldPart = oldPayload.participants[key];
                    const newPart = mergedParticipants[key];
                    
                    const becameMyTurn = newPayload.currentTurn === key && oldPayload.currentTurn !== key;
                    
                    const isDefenseOpen = useVitalsStore.getState().isDefenseOpen;
                    const queue = useNetworkStore.getState().queue;
                    const hasPendingDefense = isDefenseOpen || queue.some((q) => q.type === "COMBAT_DEFENSE");
                    
                    if (!becameMyTurn || hasPendingDefense) {
                      mergedParticipants[key].apUsed = Math.max(oldPart.apUsed || 0, newPart.apUsed || 0);
                      mergedParticipants[key].reactionUsed = Math.max(oldPart.reactionUsed || 0, newPart.reactionUsed || 0);
                    }
                  }
                }
                
                return {
                  ...e,
                  ...data,
                  payload: {
                    ...newPayload,
                    participants: mergedParticipants
                  }
                } as GameEvent;
              }
            }

            return { ...e, ...data } as GameEvent;
          }),
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
