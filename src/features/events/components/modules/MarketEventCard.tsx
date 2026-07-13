import { EventCardBase } from "../EventCardBase";
import type { MarketEvent } from "../../../../shared/types/events";
import { FiShoppingCart } from "../../../../shared/ui/Icons";

interface MarketEventCardProps {
  event: MarketEvent;
  isMaster?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPublish?: () => void;
  onRevoke?: () => void;
  onUpdateTargets?: (targets: string[]) => void;
  onOpenShop?: (eventId: string) => void;
  colorTheme?: string;
}

export function MarketEventCard({
  event,
  isMaster,
  onEdit,
  onDelete,
  onPublish,
  onRevoke,
  onUpdateTargets,
  onOpenShop,
  colorTheme,
}: MarketEventCardProps) {
  return (
    <EventCardBase event={event} isMaster={isMaster} onEdit={onEdit} onDelete={onDelete} onPublish={onPublish} onRevoke={onRevoke} onUpdateTargets={onUpdateTargets} colorTheme={colorTheme}>
      <div className="flex flex-col gap-3">
        <div className="bg-slate-800 p-3 rounded-none text-sm text-slate-300">
          <p>
            <span className="font-bold text-white">Moeda Aceita:</span>{" "}
            <span className="text-emerald-400 font-mono">{event.payload.currency}</span>
          </p>
          <p>
            <span className="font-bold text-white">Total de Itens:</span>{" "}
            {event.payload.items.length}
          </p>
        </div>

        {!isMaster && (
          <button
            onClick={() => onOpenShop && onOpenShop(event.id)}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-none shadow-md transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <FiShoppingCart /> Fazer Compras
          </button>
        )}
      </div>
    </EventCardBase>
  );
}


