import { EventCardBase } from "../EventCardBase";
import type { MerchantEvent } from "../../../../shared/types/events";
import { FiDollarSign, FiLock } from "../../../../shared/ui/Icons";

interface MerchantEventCardProps {
  event: MerchantEvent;
  isMaster?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPublish?: () => void;
  onRevoke?: () => void;
  onUpdateTargets?: (targets: string[]) => void;
  onOpenTrade?: (eventId: string) => void;
  colorTheme?: string;
}

export function MerchantEventCard({
  event,
  isMaster,
  onEdit,
  onDelete,
  onPublish,
  onRevoke,
  onUpdateTargets,
  onOpenTrade,
  colorTheme,
}: MerchantEventCardProps) {
  return (
    <EventCardBase event={event} isMaster={isMaster} onEdit={onEdit} onDelete={onDelete} onPublish={onPublish} onRevoke={onRevoke} onUpdateTargets={onUpdateTargets} colorTheme={colorTheme}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {event.payload.merchantImage && (
            <img
              src={event.payload.merchantImage}
              alt="Merchant"
              className="w-12 h-12 rounded-none border-2 border-slate-700 object-cover"
            />
          )}
          <div>
            <h4 className="font-bold text-white text-lg">{event.payload.merchantName}</h4>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-none ${
                event.payload.isOnline
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {event.payload.isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        <div className="bg-slate-800 p-3 rounded-none text-sm text-slate-300">
          <p>
            <span className="font-bold text-white">Moeda:</span>{" "}
            <span className="text-emerald-400 font-mono">{event.payload.currency}</span>
          </p>
        </div>

        {!isMaster && (
          <button
            disabled={!event.payload.isOnline}
            onClick={() => onOpenTrade && onOpenTrade(event.id)}
            className={`w-full py-2 font-bold rounded-none shadow-md transition-colors uppercase tracking-wider flex items-center justify-center gap-2 ${
              event.payload.isOnline
                ? "bg-amber-600 hover:bg-amber-500 text-white"
                : "bg-slate-700 text-slate-500 cursor-not-allowed"
            }`}
          >
            {event.payload.isOnline ? (
              <>
                <FiDollarSign /> Negociar
              </>
            ) : (
              <>
                <FiLock /> Fechado
              </>
            )}
          </button>
        )}
      </div>
    </EventCardBase>
  );
}


