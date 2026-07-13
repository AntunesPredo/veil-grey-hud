import { EventCardBase } from "../EventCardBase";
import type { P2PTransferEvent } from "../../../../shared/types/events";
import { FiRefreshCcw, FiAlertTriangle } from "../../../../shared/ui/Icons";
import { useNetworkStore } from "../../../../shared/store/useNetworkStore";

interface P2PTransferCardProps {
  event: P2PTransferEvent;
  isMaster?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPublish?: () => void;
  onRevoke?: () => void;
  onUpdateTargets?: (targets: string[]) => void;
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
  onPublish,
  onRevoke,
  onUpdateTargets,
  onJoin,
  onHostManage,
  characterId,
  colorTheme,
}: P2PTransferCardProps) {
  const isHost =
    characterId === event.payload.hostId ||
    (isMaster && event.payload.hostId === "MASTER");



  // Online Check
  const onlinePlayers = useNetworkStore((state) => state.onlinePlayers);
  const globalNpcs = useNetworkStore((state) => state.globalNpcs || []);
  const localNpcNames = useNetworkStore((state) => state.localNpcNames || []);

  const allPossibleTargets = [
    ...onlinePlayers,
    ...globalNpcs.map((n) => n.name),
    ...localNpcNames
  ];
  const isHostOnline = event.payload.hostId === "MASTER" || allPossibleTargets.includes(event.payload.hostId);

  return (
    <EventCardBase
      event={event}
      isMaster={isMaster}
      onEdit={onEdit}
      onDelete={onDelete}
      onPublish={onPublish}
      onRevoke={onRevoke}
      onUpdateTargets={onUpdateTargets}
      colorTheme={colorTheme}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-2">
          <FiRefreshCcw className="text-indigo-400 text-2xl" />
          <h4 className="font-bold text-white text-lg">Transferência Coletiva</h4>
        </div>

        <div className="bg-slate-800 p-3 rounded-none text-sm text-slate-300">
          <p>
            <span className="font-bold text-white">Fundo Atual (Pool):</span>{" "}
            <span className="text-emerald-400 font-mono">
              ${event.payload.pool} {event.payload.currency || "CC"}
            </span>
          </p>
          <p>
            <span className="font-bold text-white">Participantes:</span>{" "}
            {Object.keys(event.payload.participants || {}).length} confirmados
          </p>
          <p>
            <span className="font-bold text-white">HOST:</span>{" "}
            <span className={isHostOnline ? "text-indigo-400" : "text-red-400 font-bold"}>
              {event.payload.hostId} {isHostOnline ? "" : "(OFFLINE)"}
            </span>
          </p>
        </div>

        {!isHostOnline && !isMaster && (
          <div className="w-full py-2 bg-red-900/50 border border-red-500 text-red-300 font-bold font-mono rounded-none text-center text-xs flex items-center justify-center gap-2">
            <FiAlertTriangle /> HOST OFFLINE - OPERAÇÕES SUSPENSAS
          </div>
        )}

        {!isMaster && !isHost && isHostOnline && (
          <button
            onClick={() => onJoin && onJoin(event.id)}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-none shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-colors uppercase tracking-wider"
          >
            Acessar Transferência
          </button>
        )}

        {isHost && isHostOnline && (
          <button
            onClick={() => onHostManage && onHostManage(event.id)}
            className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-none shadow-[0_0_15px_rgba(217,119,6,0.4)] transition-colors uppercase tracking-wider"
          >
            Gerenciar Transferência (Host)
          </button>
        )}
      </div>
    </EventCardBase>
  );
}
