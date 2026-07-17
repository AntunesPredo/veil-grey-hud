import { EventCardBase } from "../EventCardBase";
import type { TestEvent } from "../../../../shared/types/events";
import { useCharacterStore } from "../../../character/store";
import { useRoller } from "../../../../shared/hooks/useRoller";
import { useNetworkStore } from "../../../../shared/store/useNetworkStore";
import { VG_CONFIG } from "../../../../shared/config/system.config";

interface TestEventCardProps {
  event: TestEvent;
  isMaster?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPublish?: () => void;
  onRevoke?: () => void;
  onUpdateTargets?: (targets: string[]) => void;
  colorTheme?: string;
}

export function TestEventCard({
  event,
  isMaster,
  onEdit,
  onDelete,
  onPublish,
  onRevoke,
  onUpdateTargets,
  colorTheme,
}: TestEventCardProps) {
  const attributes = useCharacterStore((state) => state.attributes);
  const characterId = useCharacterStore((state) => state.name);
  const { initiateRoll } = useRoller();

  const handleRoll = () => {
    let base = VG_CONFIG.rules.mainDice;
    let targets: string[] = [];

    if (event.payload.targetAttribute) {
      const val = attributes[event.payload.targetAttribute as keyof typeof attributes] || 0;
      base += val >= 0 ? `+${val}` : `${val}`;
      targets.push(event.payload.targetAttribute);
    }

    // Notify Master
    useNetworkStore.getState().sendPayload("MESTRE", "EVENT_ACTION", {
      eventId: event.id,
      action: "START_TEST",
      characterId,
    });

    initiateRoll(
      event.title || "Teste de Evento",
      base,
      targets,
      event.payload.difficulty || undefined
    );
  };

  return (
    <EventCardBase event={event} isMaster={isMaster} onEdit={onEdit} onDelete={onDelete} onPublish={onPublish} onRevoke={onRevoke} onUpdateTargets={onUpdateTargets} colorTheme={colorTheme}>
      <div className="flex flex-col gap-3">
        <div className="bg-slate-800 p-3 rounded-none text-sm text-slate-300">
          <p>
            <span className="font-bold text-white">Alvo:</span>{" "}
            {event.payload.targetAttribute || event.payload.targetSkill || "Livre"}
          </p>
          <p>
            <span className="font-bold text-white">Dificuldade:</span>{" "}
            {event.payload.difficulty !== null ? event.payload.difficulty : "Livre"}
          </p>
        </div>

        {!isMaster && (
          <button
            onClick={handleRoll}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-none shadow-md transition-colors uppercase tracking-wider"
          >
            Rolar Teste
          </button>
        )}
      </div>
    </EventCardBase>
  );
}

