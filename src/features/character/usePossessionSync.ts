import { useEffect, useRef } from "react";
import { useCharacterStore, extractCharacterData } from "./store";
import { useMasterStore } from "../master/masterStore";
import { useMasterEventsStore } from "../events/store/useMasterEventsStore";
import { useEventsStore } from "../events/store/useEventsStore";

export function usePossessionSync() {
  const charStore = useCharacterStore();
  const updateNpcData = useMasterStore((state) => state.updateNpcData);
  const npcs = useMasterStore((state) => state.npcs);
  const activeQuickActionNpcId = useMasterStore((state) => state.activeQuickActionNpcId);

  const masterEvents = useMasterEventsStore((state) => state.masterEvents);

  const prevStringified = useRef("");

  // Sync events from master store to player store when possessing
  useEffect(() => {
    const identifier = charStore.isPossessing || activeQuickActionNpcId;
    if (identifier) {
      const activeName = charStore.name;
      const targetedEvents = masterEvents.filter(
        (e) =>
          e.status === "ACTIVE" &&
          (e.targets.includes("ALL") ||
            e.targets.includes(activeName) ||
            (e.type === "COMBAT" && (e as any).payload?.participants?.[activeName]))
      );
      useEventsStore.getState().setEvents(targetedEvents);
    }
  }, [charStore.isPossessing, activeQuickActionNpcId, charStore.name, masterEvents]);

  useEffect(() => {
    const identifier = charStore.isPossessing || activeQuickActionNpcId;
    if (!identifier) return;

    const npc = npcs.find((n) => n.id === identifier || n.name === identifier);

    if (!npc) return;

    const currentData = extractCharacterData(charStore);

    const currentString = JSON.stringify(currentData);
    
    if (currentString !== prevStringified.current) {
      prevStringified.current = currentString;
      updateNpcData(npc.id, currentData as any);
    }
  }, [charStore, npcs, updateNpcData, activeQuickActionNpcId]);
}
