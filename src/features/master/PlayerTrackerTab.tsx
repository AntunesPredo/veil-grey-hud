import { useNetworkStore } from "../../shared/store/useNetworkStore";
import { PlayerCard } from "./components/PlayerCard";

import { Button } from "../../shared/ui/Form";
import { useMasterStore } from "./masterStore";
import { NpcTrackerCard } from "./components/NpcTrackerCard";
import { BroadcastFundsModal } from "./components/BroadcastFundsModal";
import { useState } from "react";

export function PlayerTrackerTab() {
  const [isFundsModalOpen, setFundsModalOpen] = useState(false);
  const onlinePlayers = useNetworkStore((state) => state.onlinePlayers);
  const telemetryData = useNetworkStore((state) => state.telemetryData);
  const npcs = useMasterStore((state) => state.npcs);

  const npcNames = npcs.map((n) => n.name);
  const activeNpcNames = npcs.filter((n) => n.isActive).map((n) => n.name);

  const knownPlayers = Array.from(
    new Set([...onlinePlayers, ...Object.keys(telemetryData)]),
  ).filter((p) => !(p === "MESTRE" || p === "SANDBOX" || p === "MAINFRAME (MESTRE)" || npcNames.includes(p)));

  const pcList = knownPlayers;
  const npcList = activeNpcNames;

  return (
    <div className="flex flex-col h-full gap-4 overflow-y-auto custom-scrollbar pr-2 pb-10">
      <div className="flex justify-between items-center border-b-2 border-[var(--theme-accent)] pb-2 shrink-0">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-[var(--theme-accent)] tracking-widest uppercase">
            TELEMETRIA GLOBAL
          </span>
          <span className="text-[10px] font-mono text-[var(--theme-text)]/50 uppercase tracking-widest">
            REGISTROS NA BASE: {pcList.length + npcList.length}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="success"
            onClick={() => setFundsModalOpen(true)}
            className="border-2 border-[var(--theme-success)] bg-black/40 hover:bg-[var(--theme-success)]/20 rounded-none font-black tracking-widest uppercase"
          >
            [ ENVIAR FUNDOS ]
          </Button>
          <Button
            size="sm"
            onClick={() => useNetworkStore.getState().forceSyncAll()}
            className="border-2 border-[var(--theme-accent)] bg-black/40 hover:bg-[var(--theme-accent)]/20 rounded-none font-black tracking-widest uppercase"
          >
            [ SYNC GLOBAL ]
          </Button>
          <Button
            size="sm"
            variant="warning"
            onClick={() => useNetworkStore.getState().clearOfflineTelemetry()}
            className="border-2 border-[var(--theme-warning)] bg-black/40 hover:bg-[var(--theme-warning)]/20 rounded-none font-black tracking-widest uppercase"
          >
            [ PURGAR OFFLINES ]
          </Button>
        </div>
      </div>
      
      <BroadcastFundsModal
        isOpen={isFundsModalOpen}
        onClose={() => setFundsModalOpen(false)}
      />

      {pcList.length === 0 && npcList.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-[var(--theme-danger)] p-10 text-[var(--theme-danger)] font-mono text-xs uppercase tracking-widest animate-pulse bg-black/40 shadow-[inset_0_0_20px_rgba(255,0,0,0.1)]">
          <svg className="w-8 h-8 mb-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          SYS.NET // ZERO_LINKS_ESTABLISHED // NENHUMA UNIDADE DETECTADA
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* PCs */}
          {pcList.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 border-b border-[var(--theme-success)]/30 pb-1">
                <div className="w-2 h-2 bg-[var(--theme-success)] animate-pulse" />
                <span className="text-xs font-bold text-[var(--theme-success)] tracking-widest uppercase">
                  UNIDADES PLAYER (PCs)
                </span>
                <span className="text-[10px] font-mono text-[var(--theme-success)]/50 ml-auto">
                  [{pcList.length} REGISTROS]
                </span>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
                {pcList.map((player) => (
                  <PlayerCard key={player} playerName={player} isNpc={false} />
                ))}
              </div>
            </div>
          )}

          {/* NPCs */}
          {npcList.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 border-b border-[var(--theme-warning)]/30 pb-1">
                <div className="w-2 h-2 bg-[var(--theme-warning)]" />
                <span className="text-xs font-bold text-[var(--theme-warning)] tracking-widest uppercase">
                  UNIDADES LOCAIS (NPCs)
                </span>
                <span className="text-[10px] font-mono text-[var(--theme-warning)]/50 ml-auto">
                  [{npcList.length} REGISTROS]
                </span>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
                {npcList.map((player) => (
                  <NpcTrackerCard key={player} playerName={player} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
