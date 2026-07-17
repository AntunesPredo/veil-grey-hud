import { useCharacterStore } from "../character/store";
import { useNetworkStore } from "../../shared/store/useNetworkStore";
import { useCombatStatus } from "./useCombatStatus";
import { useCharacterStats } from "../../shared/hooks/useCharacterStats";
import { RetroToast } from "../../shared/ui/RetroToast";
import { useEventsStore } from "../events/store/useEventsStore";

export function useCombatConsumption() {
  const combatStatus = useCombatStatus();
  const { actionPoints, isOverweight } = useCharacterStats();
  const npcType = useCharacterStore((state) => state.npcType);
  const isMasterMode = useCharacterStore((state) => state.isMasterMode);

  const isNonHuman = isMasterMode && npcType === "NON_HUMAN";
  const maxAp = actionPoints;
  const hasNoEnergy = !isNonHuman && useCharacterStore((state) => state.energy.current <= 0);

  const isCombatBlocked = !isNonHuman && combatStatus.inCombat && (!combatStatus.myTurn || (combatStatus.participant && combatStatus.participant.apUsed >= maxAp));

  const consumeAction = (costEnergy: boolean = false): boolean => {
    if (!combatStatus.inCombat) return true;

    if (!isNonHuman) {
      if (!combatStatus.myTurn) {
        RetroToast.error("NÃO É SEU TURNO.");
        return false;
      }
      if (combatStatus.participant && combatStatus.participant.apUsed >= maxAp) {
        RetroToast.error("SEM PONTOS DE AÇÃO!");
        return false;
      }
      if (costEnergy && hasNoEnergy && !useCharacterStore.getState().sandboxMode) {
        RetroToast.error("SEM ENERGIA!");
        return false;
      }
    }

    if (combatStatus.inCombat && combatStatus.myTurn && !isNonHuman) {
      const name = useCharacterStore.getState().name;
      const newApUsed = (combatStatus.participant?.apUsed || 0) + 1;
      const newEvent = structuredClone(combatStatus.combatEvent!);
      if (newEvent.payload.participants[name]) {
        newEvent.payload.participants[name].apUsed = newApUsed;
        useNetworkStore.getState().sendPayload("ALL", "EVENT_SYNC", { action: "UPSERT", event: newEvent });
        useEventsStore.getState().updateEvent(newEvent.id, newEvent);
      }

      if (costEnergy) {
        useCharacterStore.getState().consumeEnergy(isOverweight ? 2 : 1);
      }
    }

    return true;
  };

  return {
    isCombatBlocked,
    hasNoEnergy,
    consumeAction,
    maxAp,
  };
}
