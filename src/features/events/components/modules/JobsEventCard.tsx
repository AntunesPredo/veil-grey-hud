import { EventCardBase } from "../EventCardBase";
import type { JobEvent } from "../../../../shared/types/events";
import { FiBriefcase, FiCheck, FiX } from "../../../../shared/ui/Icons";

interface JobsEventCardProps {
  event: JobEvent;
  isMaster?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPush?: () => void;
  onAccept?: (eventId: string) => void;
  onReject?: (eventId: string) => void;
  onPayWorkers?: (eventId: string) => void;
  characterId?: string; // Player's ID
  colorTheme?: string;
}

export function JobsEventCard({
  event,
  isMaster,
  onEdit,
  onDelete,
  onPush,
  onAccept,
  onReject,
  onPayWorkers,
  characterId,
  colorTheme,
}: JobsEventCardProps) {
  // If player, check if already accepted
  const isAccepted =
    !isMaster && characterId && event.payload.limboTransactions?.[characterId];

  return (
    <EventCardBase event={event} isMaster={isMaster} onEdit={onEdit} onDelete={onDelete} onPush={onPush} colorTheme={colorTheme}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-2">
          <FiBriefcase className="text-slate-400 text-2xl" />
          <h4 className="font-bold text-white text-lg">{event.payload.employerName}</h4>
        </div>

        <div className="bg-slate-800 p-3 rounded-none text-sm text-slate-300">
          <p>
            <span className="font-bold text-white">Salário:</span>{" "}
            <span className="text-emerald-400 font-mono">
              ${event.payload.salary} {event.payload.currency}
            </span>
          </p>
        </div>

        {!isMaster && (
          <div className="flex gap-2">
            {isAccepted ? (
              <div className="w-full py-2 bg-emerald-900/50 border border-emerald-500 text-emerald-400 font-bold rounded-none flex items-center justify-center gap-2">
                <FiCheck /> Aceito (Aguardando Pagamento)
              </div>
            ) : (
              <>
                <button
                  onClick={() => onAccept && onAccept(event.id)}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-none shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <FiCheck /> Aceitar
                </button>
                <button
                  onClick={() => onReject && onReject(event.id)}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-none shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <FiX /> Recusar
                </button>
              </>
            )}
          </div>
        )}

        {isMaster && (
          <div className="mt-2 flex flex-col gap-2">
            <div className="text-xs text-slate-400">
              {Object.keys(event.payload.limboTransactions || {}).length} jogador(es) no limbo (aceitos).
            </div>
            {Object.keys(event.payload.limboTransactions || {}).length > 0 && (
              <button
                onClick={() => onPayWorkers && onPayWorkers(event.id)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-none shadow-md transition-colors uppercase tracking-wider text-xs"
              >
                Pagar Trabalhadores (Encerrar Job)
              </button>
            )}
          </div>
        )}
      </div>
    </EventCardBase>
  );
}


