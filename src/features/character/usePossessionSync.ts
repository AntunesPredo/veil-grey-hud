import { useEffect, useRef } from "react";
import { useCharacterStore, extractCharacterData } from "./store";
import { useMasterStore } from "../master/masterStore";

export function usePossessionSync() {
  const charStore = useCharacterStore();
  const updateNpcData = useMasterStore((state) => state.updateNpcData);
  const npcs = useMasterStore((state) => state.npcs);
  const activeQuickActionNpcId = useMasterStore((state) => state.activeQuickActionNpcId);

  const prevStringified = useRef("");

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
