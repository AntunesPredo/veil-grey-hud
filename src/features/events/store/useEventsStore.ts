import { create } from "zustand";
import type { GameEvent } from "../../../shared/types/events";
import { useVitalsStore } from "../../vitals/useVitalsStore";
import { useNetworkStore } from "../../../shared/store/useNetworkStore";

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
      activeEvents: state.activeEvents.map((e) => {
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
  setEvents: (events) => set({ activeEvents: events }),
}));
