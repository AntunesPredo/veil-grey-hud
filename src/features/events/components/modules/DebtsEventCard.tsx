import { EventCardBase } from "../EventCardBase";
import type { DebtEvent } from "../../../../shared/types/events";
import { FiAlertTriangle } from "../../../../shared/ui/Icons";

interface DebtsEventCardProps {
  event: DebtEvent;
  isMaster?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPublish?: () => void;
  onRevoke?: () => void;
  onUpdateTargets?: (targets: string[]) => void;
  onPay?: (eventId: string) => void;
  characterId?: string;
  colorTheme?: string;
}

export function DebtsEventCard({
  event,
  isMaster,
  onEdit,
  onDelete,
  onPublish,
  onRevoke,
  onUpdateTargets,
  onPay,
  characterId,
  colorTheme,
}: DebtsEventCardProps) {
  const isJoint = event.payload.debtType === "JOINT";
  
  // Calculate specific debt for this player
  let myDebt = 0;
  if (characterId && event.payload.debts && event.payload.debts[characterId] !== undefined) {
    myDebt = event.payload.debts[characterId];
  }

  const isBlinking = !isMaster && myDebt > 0;

  return (
    <EventCardBase event={event} isMaster={isMaster} onEdit={onEdit} onDelete={onDelete} onPublish={onPublish} onRevoke={onRevoke} onUpdateTargets={onUpdateTargets} colorTheme={colorTheme}>
      <div className={`flex flex-col gap-3 ${isBlinking ? "animate-pulse" : ""}`}>
        <div className="flex items-center gap-2 mb-2">
          <FiAlertTriangle className="text-red-500 text-2xl" />
          <h4 className="font-bold text-white text-lg">
            {isJoint ? "Dívida Conjunta" : "Dívida Individual"}
          </h4>
        </div>

        <div className="bg-red-900/20 border border-red-500/50 p-3 rounded-none text-sm text-slate-300">
          <p>
            <span className="font-bold text-white">Total Restante:</span>{" "}
            <span className="text-red-400 font-mono">
              ${event.payload.remainingAmount} {event.payload.currency}
            </span>
          </p>
          {!isMaster && characterId && (
            <p className="mt-2">
              <span className="font-bold text-white">Sua Cota:</span>{" "}
              <span className={myDebt > 0 ? "text-red-400 font-mono font-bold" : "text-emerald-400 font-mono font-bold"}>
                ${myDebt} {event.payload.currency}
              </span>
            </p>
          )}
        </div>

        {!isMaster && myDebt > 0 && (
          <button
            onClick={() => onPay && onPay(event.id)}
            className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-none shadow-md transition-colors uppercase tracking-wider"
          >
            Pagar Dívida
          </button>
        )}
        
        {!isMaster && myDebt <= 0 && (
          <div className="w-full py-2 bg-emerald-900/20 border border-emerald-500/50 text-emerald-400 font-bold rounded-none text-center uppercase tracking-wider">
            Dívida Quitada
          </div>
        )}
      </div>
    </EventCardBase>
  );
}


