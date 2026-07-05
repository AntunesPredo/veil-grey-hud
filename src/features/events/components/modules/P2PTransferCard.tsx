import { EventCardBase } from "../EventCardBase";
import type { P2PTransferEvent } from "../../../../shared/types/events";
import { FiRefreshCcw } from "../../../../shared/ui/Icons";

interface P2PTransferCardProps {
  event: P2PTransferEvent;
  isMaster?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPush?: () => void;
  onJoin?: (eventId: string) => void;
  onHostManage?: (eventId: string) => void;
  characterId?: string;
  colorTheme?: string;
}

export function P2PTransferCard({
  event,
  isMaster,
  onEdit,
  onDelete,
  onPush,
  onJoin,
  onHostManage,
  characterId,
  colorTheme,
}: P2PTransferCardProps) {
  const isHost =
    characterId === event.payload.hostId ||
    (isMaster && event.payload.hostId === "MASTER");
  
  const isParticipant =
    !isMaster && characterId && event.payload.participants[characterId];

  return (
    <EventCardBase event={event} isMaster={isMaster} onEdit={onEdit} onDelete={onDelete} onPush={onPush} colorTheme={colorTheme}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-2">
          <FiRefreshCcw className="text-indigo-400 text-2xl" />
          <h4 className="font-bold text-white text-lg">Transferência Coletiva</h4>
        </div>

        <div className="bg-slate-800 p-3 rounded-none text-sm text-slate-300">
          <p>
            <span className="font-bold text-white">Fundo Atual (Pool):</span>{" "}
            <span className="text-emerald-400 font-mono">
              ${event.payload.pool} {event.payload.currency}
            </span>
          </p>
          <p>
            <span className="font-bold text-white">Participantes:</span>{" "}
            {Object.keys(event.payload.participants || {}).length} confirmados
          </p>
        </div>

        {!isMaster && !isHost && !isParticipant && (
          <button
            onClick={() => onJoin && onJoin(event.id)}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-none shadow-md transition-colors uppercase tracking-wider"
          >
            Participar
          </button>
        )}

        {isHost && (
          <button
            onClick={() => onHostManage && onHostManage(event.id)}
            className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-none shadow-md transition-colors uppercase tracking-wider"
          >
            Gerenciar Transferência (Host)
          </button>
        )}
        
        {!isHost && isParticipant && (
          <div className="w-full py-2 bg-slate-700 text-slate-300 font-bold rounded-none text-center uppercase tracking-wider">
            Aguardando Host...
          </div>
        )}
      </div>
    </EventCardBase>
  );
}


