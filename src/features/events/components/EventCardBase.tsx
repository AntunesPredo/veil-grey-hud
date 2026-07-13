import React, { useState } from "react";
import type { GameEvent } from "../../../shared/types/events";
import { FiEdit2, FiUsers, FiTrash2, FiSend, FiX, FiPlus, FiAlertTriangle } from "../../../shared/ui/Icons";
import { SmartImage } from "../../../shared/ui/SmartImage";
import { Button } from "../../../shared/ui/Form";
import { TargetSelectionModal } from "../../../shared/ui/TargetSelectionModal";
import { useNetworkStore } from "../../../shared/store/useNetworkStore";
import { Modal } from "../../../shared/ui/Overlays";

interface EventCardBaseProps {
  event: GameEvent;
  isMaster?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPublish?: () => void;
  onRevoke?: () => void;
  onUpdateTargets?: (targets: string[]) => void;
  children: React.ReactNode;
  colorTheme?: string;
}

export function EventCardBase({
  event,
  isMaster = false,
  onEdit,
  onDelete,
  onPublish,
  onRevoke,
  onUpdateTargets,
  children,
  colorTheme = "border-slate-800",
}: EventCardBaseProps) {
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [selectedTargetAction, setSelectedTargetAction] = useState<string | null>(null);
  
  const onlinePlayers = useNetworkStore((state) => state.onlinePlayers);
  const isOnline = event.status === "ACTIVE";

  const handleAddTargets = (newTargets: string[]) => {
    if (!onUpdateTargets) return;
    const combined = Array.from(new Set([...event.targets, ...newTargets]));
    onUpdateTargets(combined);
  };

  const handleRemoveTarget = (target: string) => {
    if (!onUpdateTargets) return;
    const filtered = event.targets.filter((t) => t !== target);
    onUpdateTargets(filtered);
  };

  const handleForcePushTarget = (target: string) => {
    if (isOnline) {
      useNetworkStore.getState().sendPayload(target, "EVENT_SYNC", { action: "UPSERT", event });
    }
  };

  return (
    <div className={`flex flex-col bg-slate-900 border ${colorTheme} rounded-none overflow-hidden shadow-xl mb-4 relative`}>
      {/* Cover Image */}
      {event.coverImage && (
        <SmartImage image={event.coverImage} className="border-b border-slate-800" />
      )}

      {/* Header */}
      <div className={`p-4 border-b ${colorTheme} flex justify-between items-start bg-slate-900/50`}>
        <div className="w-full">
          <div className="flex justify-between items-center w-full">
            <h3 className="text-xl font-bold text-white uppercase tracking-wider">
              {event.title}
            </h3>
            {isOnline && (
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-2 py-0.5 text-[10px] font-bold tracking-widest rounded-none">
                ONLINE
              </span>
            )}
            {!isOnline && isMaster && (
              <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 text-[10px] font-bold tracking-widest rounded-none">
                DRAFT
              </span>
            )}
          </div>
          {event.description && (
            <p className="text-sm text-slate-400 mt-1 font-mono">{event.description}</p>
          )}
          <div className="mt-2 text-xs text-slate-500 font-mono">
            <FiUsers className="inline mr-1" /> {event.targets.length} participantes
          </div>
        </div>
      </div>

      {/* Body / Module specifics */}
      <div className="p-4">{children}</div>

      {/* Master Panel */}
      {isMaster && (
        <div className={`border-t ${colorTheme} bg-slate-950 p-4 flex flex-col md:flex-row gap-4`}>
          {/* Actions Side */}
          <div className="flex flex-col gap-2 md:w-1/3">
            <h4 className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1">Ações do Mestre</h4>
            
            {isOnline ? (
              <Button variant="danger" onClick={onRevoke} className="w-full flex justify-center items-center gap-2 py-3">
                <FiX /> REVOGAR EVENTO
              </Button>
            ) : (
              <Button variant="success" onClick={onPublish} className="w-full flex justify-center items-center gap-2 py-3 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <FiSend /> PUBLICAR EVENTO
              </Button>
            )}

            <div className="flex flex-col gap-2 mt-2">
              <Button variant="primary" onClick={onEdit} className="w-full flex justify-center items-center gap-2 border-dashed">
                <FiEdit2 /> EDITAR EVENTO
              </Button>
              <Button variant="danger" onClick={onDelete} className="w-full flex justify-center items-center gap-2 border-dashed">
                <FiTrash2 /> EXCLUIR EVENTO
              </Button>
            </div>
          </div>

          {/* Targets Side */}
          <div className="flex flex-col gap-2 md:w-2/3 border-l border-slate-800 pl-4">
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Lista de Alvos</h4>
              <Button variant="primary" size="sm" onClick={() => setIsTargetModalOpen(true)} className="text-[10px] py-1 px-2 flex items-center gap-1">
                <FiPlus /> ADICIONAR ALVOS
              </Button>
            </div>
            
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto custom-scrollbar pr-2">
              {event.targets.length === 0 ? (
                <span className="text-xs text-slate-600 font-mono italic">Nenhum alvo definido.</span>
              ) : (
                event.targets.map(target => {
                  const isTargetOnline = onlinePlayers.includes(target) || target === "ALL";
                  
                  return (
                    <button 
                      key={target} 
                      onClick={() => setSelectedTargetAction(target)}
                      className="flex items-center justify-between bg-slate-800 border border-slate-700 hover:border-indigo-500 hover:bg-indigo-900/20 p-2 min-w-[140px] transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isTargetOnline ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`} />
                        <span className="text-xs font-bold text-slate-300 truncate" title={target}>
                          {target}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 opacity-50 uppercase tracking-widest">Opções</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {isTargetModalOpen && (
        <TargetSelectionModal
          isOpen={isTargetModalOpen}
          onClose={() => setIsTargetModalOpen(false)}
          onSelect={handleAddTargets}
          title="ADICIONAR ALVOS AO EVENTO"
          allowAll={true}
        />
      )}

      {selectedTargetAction && (
        <Modal title={`AÇÕES DO ALVO: ${selectedTargetAction}`} onClose={() => setSelectedTargetAction(null)} isOpen={true} maxWidth="max-w-sm">
          <div className="p-4 flex flex-col gap-4 text-center">
             <div className="text-slate-300 font-mono text-xs flex flex-col items-center gap-2 mb-2">
                <FiAlertTriangle className="text-2xl text-indigo-400" />
                Selecione a ação que deseja realizar com o alvo selecionado.
             </div>
             <div className="flex flex-col gap-2">
                <Button 
                   onClick={() => {
                      handleForcePushTarget(selectedTargetAction);
                      setSelectedTargetAction(null);
                   }}
                   disabled={!isOnline}
                   className="w-full flex items-center justify-center gap-2"
                >
                   <FiSend /> REENVIAR EVENTO
                </Button>
                <Button 
                   variant="danger"
                   onClick={() => {
                      handleRemoveTarget(selectedTargetAction);
                      setSelectedTargetAction(null);
                   }}
                   className="w-full flex items-center justify-center gap-2"
                >
                   <FiTrash2 /> REMOVER DO EVENTO
                </Button>
             </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
