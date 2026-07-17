import { useRef } from "react";
import type { CombatEvent, CombatParticipant } from "../../../../shared/types/events";
import { useNetworkStore } from "../../../../shared/store/useNetworkStore";
import { useCharacterStore } from "../../../character/store";
import { useMasterEventsStore } from "../../store/useMasterEventsStore";
import { RetroToast } from "../../../../shared/ui/RetroToast";
import { executeRawRoll } from "../../../../shared/utils/diceEngine";
import { FiUsers, FiLock } from "../../../../shared/ui/Icons";
import { Input, Button } from "../../../../shared/ui/Form";
import { EventCardBase } from "../EventCardBase";
import { useMasterStore } from "../../../master/masterStore";
import { motion } from "framer-motion";
import { VG_CONFIG } from "../../../../shared/config/system.config";

interface CombatEventCardProps {
  event: CombatEvent;
  isMaster: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onPublish: () => void;
  onRevoke: () => void;
  onUpdateTargets: (targets: string[]) => void;
  colorTheme: string;
}

export function CombatEventCard({
  event,
  isMaster,
  onEdit,
  onDelete,
  onPublish,
  onRevoke,
  onUpdateTargets,
  colorTheme,
}: CombatEventCardProps) {
  const isPending = event.status === "PENDING";
  const name = useCharacterStore((state) => state.name);
  const attributes = useCharacterStore((state) => state.attributes);

  // Npc stuff when Master is possessing
  const isPossessing = !!useMasterStore.getState().masterBackup;
  const isMasterMode = useCharacterStore((state) => state.isMasterMode);

  const currentParticipantName = name;
  const isParticipant = !!event.payload.participants[currentParticipantName];

  const handleJoinCombat = () => {
    let dexterity = 0;
    if (isPossessing) {
      const agi = useCharacterStore.getState().attributes?.dexterity || 0;
      const inst = useCharacterStore.getState().attributes?.instinct || 0;
      dexterity = agi + inst;
    } else if (!isMasterMode) {
      const agi = attributes.dexterity || 0;
      const inst = attributes.instinct || 0;
      dexterity = agi + inst;
    }

    const rollRes = executeRawRoll(`${VG_CONFIG.rules.mainDice}+${dexterity}`);
    const initiative = rollRes.total;

    const newParticipant: CombatParticipant = {
      id: currentParticipantName,
      name: currentParticipantName,
      initiative,
      hasRolledInitiative: true,
      reactionUsed: 0,
      apUsed: 0,
    };

    const newEvent = { ...event };
    newEvent.payload = {
      ...newEvent.payload,
      participants: {
        ...newEvent.payload.participants,
        [currentParticipantName]: newParticipant,
      },
    };

    if (isMaster) {
      useMasterEventsStore.getState().updateEvent(event.id, newEvent);
    } else {
      useNetworkStore.getState().sendPayload("MESTRE", "EVENT_ACTION", {
        eventId: event.id,
        action: "JOIN_COMBAT",
        participant: newParticipant,
      });
    }
    RetroToast.success(`INICIATIVA ROLADA: ${initiative}`);
  };

  const handleStartCombat = () => {
    const participantsList = Object.values(event.payload.participants).sort((a, b) => b.initiative - a.initiative);
    if (participantsList.length === 0) {
      RetroToast.error("Nenhum participante no combate!");
      return;
    }

    const newEvent = { ...event };
    newEvent.payload = {
      ...newEvent.payload,
      currentRound: 1,
      currentTurn: participantsList[0].name,
    };
    if (participantsList.length > 0) {
      const firstPart = participantsList[0].name;
      if (newEvent.payload.participants[firstPart]) {
        newEvent.payload.participants[firstPart].reactionUsed = 0;
        newEvent.payload.participants[firstPart].apUsed = 0;
      }
    }

    useMasterEventsStore.getState().updateEvent(event.id, newEvent);
    useNetworkStore.getState().sendPayload("ALL", "EVENT_SYNC", { action: "UPSERT", event: newEvent });
  };

  const handleNextTurn = () => {
    const participantsList = Object.values(event.payload.participants).sort((a, b) => b.initiative - a.initiative);
    if (participantsList.length === 0) return;

    if (participantsList.every(p => p.isBlocked)) return;

    let currentIndex = participantsList.findIndex(p => p.name === event.payload.currentTurn);
    let nextIndex = currentIndex + 1;
    let nextRound = event.payload.currentRound;

    if (nextIndex >= participantsList.length) {
      nextIndex = 0;
      nextRound += 1;
    }

    while (participantsList[nextIndex].isBlocked) {
      nextIndex += 1;
      if (nextIndex >= participantsList.length) {
        nextIndex = 0;
        nextRound += 1;
      }
    }

    const nextTurnParticipant = participantsList[nextIndex].name;

    const newEvent = { ...event };
    newEvent.payload = {
      ...newEvent.payload,
      currentRound: nextRound,
      currentTurn: nextTurnParticipant,
    };

    newEvent.payload.currentTurn = nextTurnParticipant;
    newEvent.payload.participants[nextTurnParticipant].apUsed = 0;
    newEvent.payload.participants[nextTurnParticipant].reactionUsed = 0;
    useMasterEventsStore.getState().updateEvent(event.id, newEvent);
    useNetworkStore.getState().sendPayload("ALL", "EVENT_SYNC", { action: "UPSERT", event: newEvent });
  };

  const handleUpdateInitiative = (participantName: string, newInitiative: number) => {
    const newEvent = { ...event };
    if (newEvent.payload.participants[participantName]) {
      newEvent.payload.participants[participantName].initiative = newInitiative;
      useMasterEventsStore.getState().updateEvent(event.id, newEvent);
      useNetworkStore.getState().sendPayload("ALL", "EVENT_SYNC", { action: "UPSERT", event: newEvent });
    }
  };

  const handleToggleBlock = (participantName: string) => {
    if (!isMaster || isPossessing) return;
    const newEvent = structuredClone(event) as any;
    if (newEvent.payload.participants[participantName]) {
      newEvent.payload.participants[participantName].isBlocked = !newEvent.payload.participants[participantName].isBlocked;
      useMasterEventsStore.getState().updateEvent(event.id, newEvent);
      useNetworkStore.getState().sendPayload("ALL", "EVENT_SYNC", { action: "UPSERT", event: newEvent });
      RetroToast.success(newEvent.payload.participants[participantName].isBlocked ? "PARTICIPANTE BLOQUEADO" : "PARTICIPANTE DESBLOQUEADO");
    }
  };

  const longPressTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const handlePointerDown = (participantName: string) => {
    if (!isMaster || isPossessing) return;
    longPressTimers.current[participantName] = setTimeout(() => {
      handleToggleBlock(participantName);
    }, 600);
  };

  const handlePointerUp = (participantName: string) => {
    if (longPressTimers.current[participantName]) {
      clearTimeout(longPressTimers.current[participantName]);
      delete longPressTimers.current[participantName];
    }
  };

  const handleSetTurn = (participantName: string) => {
    if (!isMaster || isPossessing) return;
    const newEvent = structuredClone(event) as any;
    newEvent.payload.currentTurn = participantName;

    if (newEvent.payload.participants[participantName]) {
      newEvent.payload.participants[participantName].apUsed = 0;
      newEvent.payload.participants[participantName].reactionUsed = 0;
    }

    useMasterEventsStore.getState().updateEvent(event.id, newEvent);
    useNetworkStore.getState().sendPayload("ALL", "EVENT_SYNC", { action: "UPSERT", event: newEvent });
  };

  const handlePrevRound = () => {
    if (!isMaster || isPossessing) return;
    const newEvent = structuredClone(event) as any;
    newEvent.payload.currentRound = Math.max(1, (newEvent.payload.currentRound || 1) - 1);
    useMasterEventsStore.getState().updateEvent(event.id, newEvent);
    useNetworkStore.getState().sendPayload("ALL", "EVENT_SYNC", { action: "UPSERT", event: newEvent });
  };

  const handleNextRound = () => {
    if (!isMaster || isPossessing) return;
    const newEvent = structuredClone(event) as any;
    newEvent.payload.currentRound = (newEvent.payload.currentRound || 0) + 1;
    useMasterEventsStore.getState().updateEvent(event.id, newEvent);
    useNetworkStore.getState().sendPayload("ALL", "EVENT_SYNC", { action: "UPSERT", event: newEvent });
  };

  const sortedParticipants = Object.values(event.payload.participants).sort((a, b) => b.initiative - a.initiative);

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
      <div className="flex gap-4 text-[10px] font-mono font-bold uppercase pt-2 mb-2">
        <div className="flex items-center gap-1 text-red-400">
          RODADA {event.payload.currentRound || 0}
        </div>
        <div className="flex items-center gap-1 text-orange-400">
          <FiUsers /> {sortedParticipants.length} PARTICIPANTES
        </div>
      </div>

      {/* COMBAT FLOW UI */}
      {!isPending && (
        <div className="flex flex-col gap-2 border border-red-500/30 bg-red-900/10 p-2">
          {!isParticipant && (!isMasterMode || isPossessing) && (
            <Button variant="danger" className="w-full text-xs py-1 animate-pulse" onClick={handleJoinCombat}>
              RODAR INICIATIVA E ENTRAR NO COMBATE
            </Button>
          )}

          {sortedParticipants.length > 0 && (
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1 border-b border-red-500/30">ORDEM DE INICIATIVA</span>
              {sortedParticipants.map((p, idx) => {
                const isCurrentTurn = p.name === event.payload.currentTurn;
                return (
                  <div
                    key={p.name}
                    className={`flex items-center gap-2 px-2 py-1 border transition-colors select-none ${isCurrentTurn ? "border-red-500 bg-red-500/20 shadow-[0_0_8px_rgba(255,0,0,0.4)]" : "border-slate-800 bg-slate-900/50"} ${isMaster && !isPossessing ? "cursor-pointer hover:border-red-500/50" : ""} ${p.isBlocked ? "opacity-40 grayscale" : ""}`}
                    onClick={() => handleSetTurn(p.name)}
                    onPointerDown={() => handlePointerDown(p.name)}
                    onPointerUp={() => handlePointerUp(p.name)}
                    onPointerLeave={() => handlePointerUp(p.name)}
                  >
                    <div className="w-4 flex justify-center items-center shrink-0 text-red-500">
                      {isCurrentTurn ? (
                        <motion.div
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          ▶
                        </motion.div>
                      ) : p.isBlocked ? (
                        <FiLock className="text-slate-500" />
                      ) : null}
                    </div>

                    <div className="flex-1 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isCurrentTurn ? "text-red-400" : "text-slate-300"} ${p.isBlocked ? "line-through text-slate-500" : ""}`}>{idx + 1}. {p.name}</span>
                        {isCurrentTurn && <span className="text-[9px] bg-red-600 text-white px-1 rounded animate-pulse">TURNO</span>}
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {isMaster && !isPossessing ? (
                          <Input
                            type="number"
                            value={p.initiative}
                            onChange={(e) => handleUpdateInitiative(p.name, parseInt(e.target.value) || 0)}
                            className="w-14 text-center h-6 text-xs p-0 border-red-500/50 bg-black text-red-400"
                          />
                        ) : (
                          <span className="text-xs font-mono font-bold text-red-400">{p.initiative}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {isMaster && !isPossessing && (
            <div className="flex gap-2 mt-2 pt-2 border-t border-red-500/30">
              {event.payload.currentRound === 0 ? (
                <Button variant="danger" className="flex-1 text-xs" onClick={handleStartCombat}>
                  INICIAR COMBATE
                </Button>
              ) : (
                <div className="flex w-full gap-1">
                  <Button variant="primary" className="flex-1 text-xs px-1" onClick={handlePrevRound} title="Voltar Rodada">
                    <span className="font-mono text-lg font-bold">{"<<"}</span>
                  </Button>
                  <Button variant="primary" className="flex-[3] text-sm font-bold" onClick={handleNextTurn} title="Avançar Turno">
                    <span className="font-mono text-xl font-bold">{">"}</span>
                  </Button>
                  <Button variant="primary" className="flex-1 text-xs px-1" onClick={handleNextRound} title="Avançar Rodada">
                    <span className="font-mono text-lg font-bold">{">>"}</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </EventCardBase>
  );
}
