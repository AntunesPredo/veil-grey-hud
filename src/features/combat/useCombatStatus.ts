import { useEventsStore } from "../events/store/useEventsStore";
import { useCharacterStore } from "../character/store";
import type { CombatEvent, EventBase } from "../../shared/types/events";

export function useCombatStatus() {
  const name = useCharacterStore((state) => state.name);
  const activeEvents = useEventsStore((state) => state.activeEvents);

  const combatEvent = activeEvents.find(
    (e: EventBase) => e.type === "COMBAT" && (e as CombatEvent).payload.participants[name] && (e as CombatEvent).payload.currentRound > 0
  ) as CombatEvent | undefined;

  const inCombat = !!combatEvent;
  const myTurn = inCombat && combatEvent?.payload.currentTurn === name;
  const participant = inCombat ? combatEvent.payload.participants[name] : undefined;

  return {
    inCombat,
    combatEvent,
    myTurn,
    participant,
  };
}
