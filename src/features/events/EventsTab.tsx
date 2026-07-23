import { useState, useEffect } from "react";
import { useEventsStore } from "./store/useEventsStore";
import { useMasterEventsStore } from "./store/useMasterEventsStore";
import { TestEventCard } from "./components/modules/TestEventCard";
import { MarketEventCard } from "./components/modules/MarketEventCard";
import { MerchantEventCard } from "./components/modules/MerchantEventCard";
import { JobsEventCard } from "./components/modules/JobsEventCard";
import { DebtsEventCard } from "./components/modules/DebtsEventCard";
import { P2PTransferCard } from "./components/modules/P2PTransferCard";
import { CombatEventCard } from "./components/modules/CombatEventCard";
import type { GameEvent, EventType } from "../../shared/types/events";
import { useCharacterStore } from "../character/store";
import { useNetworkStore } from "../../shared/store/useNetworkStore";
import { Button } from "../../shared/ui/Form";
import { FiPlus, FiList } from "../../shared/ui/Icons";
import { MasterEventEditorModal } from "./components/MasterEventEditorModal";
import { MasterEventLogsModal } from "./components/MasterEventLogsModal";
import { DebtPaymentModal } from "./components/DebtPaymentModal";
import { P2PPaymentModal } from "./components/P2PPaymentModal";
import { P2PHostManageModal } from "./components/P2PHostManageModal";
import { MarketPurchaseModal } from "./components/MarketPurchaseModal";
import { JobAcceptModal } from "./components/JobAcceptModal";
import { JobPaymentMasterModal } from "./components/JobPaymentMasterModal";
import { JobPaymentHistoryModal } from "./components/JobPaymentHistoryModal";
import { JobRejectModal } from "./components/JobRejectModal";
import { RetroToast } from "../../shared/ui/RetroToast";
import { HardwareAccordion } from "../../shared/ui/HardwareAccordion";

interface EventsTabProps {
  isMaster?: boolean;
}

import { EventResultManager } from "./components/EventResultManager";

export function EventsTab({ isMaster = false }: EventsTabProps) {
  const playerEvents = useEventsStore((state) => state.activeEvents);
  const masterEvents = useMasterEventsStore((state) => state.masterEvents);
  const characterId = useCharacterStore((state) => state.name);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<GameEvent | undefined>(undefined);
  const [debtPaymentEvent, setDebtPaymentEvent] = useState<any | undefined>(undefined);
  const [p2pPaymentEvent, setP2pPaymentEvent] = useState<any | undefined>(undefined);
  const [p2pHostManageEvent, setP2pHostManageEvent] = useState<any | undefined>(undefined);
  const [marketPurchaseEvent, setMarketPurchaseEvent] = useState<any | undefined>(undefined);
  const [jobAcceptEvent, setJobAcceptEvent] = useState<any | undefined>(undefined);
  const [jobRejectEvent, setJobRejectEvent] = useState<any | undefined>(undefined);
  const [jobPaymentEvent, setJobPaymentEvent] = useState<any | undefined>(undefined);
  const [jobHistoryEvent, setJobHistoryEvent] = useState<any | undefined>(undefined);

  const events = isMaster ? masterEvents : playerEvents;

  useEffect(() => {
    if (!isMaster) {
      if (p2pPaymentEvent) {
        const liveEvent = events.find(e => e.id === p2pPaymentEvent.id);
        const isTargeted = liveEvent && (liveEvent.targets.includes(characterId) || liveEvent.targets.includes("ALL"));
        if (!liveEvent || !isTargeted) {
          setP2pPaymentEvent(undefined);
        }
      }
      if (marketPurchaseEvent) {
        const liveEvent = events.find(e => e.id === marketPurchaseEvent.id);
        const isTargeted = liveEvent && (liveEvent.targets.includes(characterId) || liveEvent.targets.includes("ALL"));
        if (!liveEvent || !isTargeted) {
          setMarketPurchaseEvent(undefined);
        }
      }
      if (debtPaymentEvent) {
        const liveEvent = events.find(e => e.id === debtPaymentEvent.id);
        const isTargeted = liveEvent && (liveEvent.targets.includes(characterId) || liveEvent.targets.includes("ALL"));
        if (!liveEvent || !isTargeted) {
          setDebtPaymentEvent(undefined);
        }
      }
      if (jobAcceptEvent) {
        const liveEvent = events.find(e => e.id === jobAcceptEvent.id);
        const isTargeted = liveEvent && (liveEvent.targets.includes(characterId) || liveEvent.targets.includes("ALL"));
        if (!liveEvent || !isTargeted) {
          setJobAcceptEvent(undefined);
        }
      }
      if (jobRejectEvent) {
        const liveEvent = events.find(e => e.id === jobRejectEvent.id);
        const isTargeted = liveEvent && (liveEvent.targets.includes(characterId) || liveEvent.targets.includes("ALL"));
        if (!liveEvent || !isTargeted) {
          setJobRejectEvent(undefined);
        }
      }
    } else {
      if (jobPaymentEvent) {
        const liveEvent = events.find(e => e.id === jobPaymentEvent.id);
        if (!liveEvent) setJobPaymentEvent(undefined);
      }
    }
    if (jobHistoryEvent) {
      const liveEvent = events.find(e => e.id === jobHistoryEvent.id);
      if (!liveEvent) setJobHistoryEvent(undefined);
    }
  }, [events, p2pPaymentEvent, marketPurchaseEvent, debtPaymentEvent, jobAcceptEvent, jobRejectEvent, jobPaymentEvent, jobHistoryEvent, characterId, isMaster]);

  const EVENT_COLORS: Record<EventType, string> = {
    TEST: "border-indigo-500",
    MARKET: "border-emerald-500",
    MERCHANT: "border-amber-500",
    JOB: "border-cyan-500",
    DEBT: "border-red-500",
    P2P_TRANSFER: "border-purple-500",
    COMBAT: "border-red-600",
  };

  const handleEdit = (event: GameEvent) => {
    setEventToEdit(event);
    setIsEditorOpen(true);
  };

  const handleCreateNew = () => {
    setEventToEdit(undefined);
    setIsEditorOpen(true);
  };

  const handleDelete = (id: string) => {
    useMasterEventsStore.getState().removeEvent(id);
    useNetworkStore.getState().sendPayload("ALL", "EVENT_SYNC", { action: "DELETE", eventId: id });
  };

  const handlePublish = (event: GameEvent) => {
    if (event.type === "P2P_TRANSFER") {
      const p2p = event as any;
      const host = p2p.payload.hostId;
      const state = useNetworkStore.getState();
      const allOnline = [
        ...state.onlinePlayers,
        ...(state.globalNpcs || []).map(n => n.name),
        ...(state.localNpcNames || [])
      ];
      if (host !== "MASTER" && !allOnline.includes(host)) {
        RetroToast.error("HOST OFFLINE! Não é possível publicar a transferência.");
        return;
      }
    }

    let updatedEvent = { ...event, status: "ACTIVE" } as GameEvent;

    if (updatedEvent.type === "P2P_TRANSFER") {
      updatedEvent = {
        ...updatedEvent,
        payload: {
          ...updatedEvent.payload,
          participants: {},
          hostIsPresent: false,
          hostConfirmed: false,
          isAllConfirmed: false,
          transactions: []
        }
      } as any;
    }

    useMasterEventsStore.getState().updateEvent(event.id, updatedEvent);
    useNetworkStore.getState().sendPayload("ALL", "EVENT_SYNC", { action: "UPSERT", event: updatedEvent });
    RetroToast.success("EVENTO PUBLICADO");
  };

  const handleRevoke = (event: GameEvent) => {
    const updatedEvent = { ...event, status: "PENDING" } as GameEvent;

    if (updatedEvent.type === "COMBAT") {
      updatedEvent.payload = {
        ...updatedEvent.payload,
        participants: {},
        currentRound: 0,
        currentTurn: null,
      };
    }

    if (updatedEvent.type === "JOB") {
      updatedEvent.payload = {
        ...updatedEvent.payload,
        hiredWorkers: {},
      };
    }

    useMasterEventsStore.getState().updateEvent(event.id, updatedEvent);
    useNetworkStore.getState().sendPayload("ALL", "EVENT_SYNC", { action: "DELETE", eventId: event.id, eventType: event.type, wasRecurring: (event.payload as any).isRecurring, isCompleted: false });
    RetroToast.warning("EVENTO REVOGADO");
  };

  const handleUpdateTargets = (eventId: string, newTargets: string[]) => {
    const event = masterEvents.find(e => e.id === eventId);
    if (!event) return;
    let updatedEvent = { ...event, targets: newTargets } as GameEvent;

    if (updatedEvent.type === "P2P_TRANSFER") {
      const parts = { ...updatedEvent.payload.participants };
      let changed = false;
      Object.keys(parts).forEach(k => {
        if (!newTargets.includes(k)) {
          delete parts[k];
          changed = true;
        }
      });
      if (changed) {
        Object.keys(parts).forEach(k => {
          parts[k] = { ...parts[k], transferConfirmed: false };
        });
        updatedEvent = {
          ...updatedEvent,
          payload: {
            ...updatedEvent.payload,
            hostConfirmed: false,
            participants: parts
          }
        } as any;
      }
    }

    useMasterEventsStore.getState().updateEvent(eventId, updatedEvent);

    if (updatedEvent.status === "ACTIVE") {
      useNetworkStore.getState().sendPayload("ALL", "EVENT_SYNC", { action: "UPSERT", event: updatedEvent });
      RetroToast.success("ALVOS ATUALIZADOS");
    }
  };

  const renderEvent = (event: GameEvent) => {
    const colorTheme = EVENT_COLORS[event.type] || "border-slate-800";
    const cardProps = {
      event,
      isMaster,
      onEdit: () => handleEdit(event),
      onDelete: () => handleDelete(event.id),
      onPublish: () => handlePublish(event),
      onRevoke: () => handleRevoke(event),
      onUpdateTargets: (targets: string[]) => handleUpdateTargets(event.id, targets),
      colorTheme,
    };

    switch (event.type) {
      case "TEST":
        return <TestEventCard key={event.id} {...cardProps} event={event as any} />;
      case "MARKET":
        return (
          <MarketEventCard
            key={event.id}
            {...cardProps}
            event={event as any}
            onOpenShop={() => setMarketPurchaseEvent(event)}
          />
        );
      case "MERCHANT":
        return <MerchantEventCard key={event.id} {...cardProps} event={event as any} />;
      case "JOB":
        return (
          <JobsEventCard
            key={event.id}
            {...cardProps}
            event={event as any}
            characterId={characterId}
            onAccept={() => setJobAcceptEvent(event)}
            onReject={() => setJobRejectEvent(event)}
            onPayWorkers={() => setJobPaymentEvent(event)}
            onViewHistory={() => setJobHistoryEvent(event)}
          />
        );
      case "DEBT":
        return (
          <DebtsEventCard
            key={event.id}
            {...cardProps}
            event={event as any}
            characterId={characterId}
            onPay={() => setDebtPaymentEvent(event)}
          />
        );
      case "P2P_TRANSFER":
        return (
          <P2PTransferCard
            key={event.id}
            {...cardProps}
            event={event as any}
            characterId={characterId}
            onJoin={() => setP2pPaymentEvent(event)}
            onHostManage={() => setP2pHostManageEvent(event)}
          />
        );
      case "COMBAT":
        return <CombatEventCard key={event.id} {...cardProps} event={event as any} />;
      default:
        return null;
    }
  };

  const renderModals = () => (
    <>
      <EventResultManager />
      <MasterEventEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        eventToEdit={eventToEdit}
      />
      <MasterEventLogsModal
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
      />
      {debtPaymentEvent && (
        <DebtPaymentModal
          isOpen={!!debtPaymentEvent}
          onClose={() => setDebtPaymentEvent(undefined)}
          event={(events.find(e => e.id === debtPaymentEvent.id) || debtPaymentEvent) as any}
        />
      )}
      {p2pPaymentEvent && (
        <P2PPaymentModal
          isOpen={!!p2pPaymentEvent}
          onClose={() => setP2pPaymentEvent(undefined)}
          event={(events.find(e => e.id === p2pPaymentEvent.id) || p2pPaymentEvent) as any}
        />
      )}
      {p2pHostManageEvent && (
        <P2PHostManageModal
          isOpen={!!p2pHostManageEvent}
          onClose={() => setP2pHostManageEvent(undefined)}
          event={(events.find(e => e.id === p2pHostManageEvent.id) || p2pHostManageEvent) as any}
          isMaster={isMaster}
        />
      )}
      {marketPurchaseEvent && (
        <MarketPurchaseModal
          isOpen={!!marketPurchaseEvent}
          onClose={() => setMarketPurchaseEvent(undefined)}
          event={(events.find(e => e.id === marketPurchaseEvent.id) || marketPurchaseEvent) as any}
        />
      )}
      {jobAcceptEvent && (
        <JobAcceptModal
          isOpen={!!jobAcceptEvent}
          onClose={() => setJobAcceptEvent(undefined)}
          event={(events.find(e => e.id === jobAcceptEvent.id) || jobAcceptEvent) as any}
          onConfirm={(walletId) => {
            useNetworkStore.getState().sendPayload("MESTRE", "EVENT_ACTION", {
              eventId: jobAcceptEvent.id,
              action: "ACCEPT_JOB",
              characterId,
              walletId
            });
            RetroToast.success("EMPREGO ACEITO! Aguardando pagamento.");
            setJobAcceptEvent(undefined);
          }}
        />
      )}
      {jobRejectEvent && (
        <JobRejectModal
          isOpen={!!jobRejectEvent}
          onClose={() => setJobRejectEvent(undefined)}
          event={(events.find(e => e.id === jobRejectEvent.id) || jobRejectEvent) as any}
          characterId={characterId}
        />
      )}
      {jobPaymentEvent && isMaster && (
        <JobPaymentMasterModal
          isOpen={!!jobPaymentEvent}
          onClose={() => setJobPaymentEvent(undefined)}
          event={(events.find(e => e.id === jobPaymentEvent.id) || jobPaymentEvent) as any}
          onConfirm={(adjustments) => {
            useNetworkStore.getState().sendPayload("MESTRE", "EVENT_ACTION", {
              eventId: jobPaymentEvent.id,
              action: "PAY_WORKERS",
              adjustments
            });
            setJobPaymentEvent(undefined);
          }}
        />
      )}
      {jobHistoryEvent && (
        <JobPaymentHistoryModal
          isOpen={!!jobHistoryEvent}
          onClose={() => setJobHistoryEvent(undefined)}
          event={(events.find(e => e.id === jobHistoryEvent.id) || jobHistoryEvent) as any}
          isMaster={isMaster}
          characterId={characterId}
        />
      )}
    </>
  );

  // Group events by type
  const groupedEvents = events.reduce((acc, event) => {
    if (!acc[event.type]) acc[event.type] = [];
    acc[event.type].push(event);
    return acc;
  }, {} as Record<EventType, GameEvent[]>);

  const categories: { type: EventType; label: string }[] = [
    { type: "TEST", label: "TESTES" },
    { type: "MARKET", label: "MERCADO" },
    { type: "MERCHANT", label: "MERCADORES" },
    { type: "JOB", label: "TRABALHOS" },
    { type: "DEBT", label: "DÍVIDAS" },
    { type: "P2P_TRANSFER", label: "TRANSFERÊNCIAS (P2P)" },
    { type: "COMBAT", label: "COMBATE" },
  ];

  return (
    <div className="flex flex-col h-full relative">
      {isMaster ? (
        <div className="flex justify-between items-center bg-slate-900 border-2 border-[var(--theme-accent)] p-4 shadow-[0_0_15px_var(--theme-accent)]/20 mb-6">
          <div>
            <h2 className="text-[var(--theme-accent)] font-bold tracking-widest text-lg">PAINEL DO MESTRE</h2>
            <p className="text-xs text-slate-400 font-mono">Gerencie os eventos globais ou diretos para jogadores.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsLogsOpen(true)} variant="warning" className="flex items-center gap-2">
              <FiList /> VER LOGS
            </Button>
            <Button onClick={handleCreateNew} variant="primary" className="flex items-center gap-2">
              <FiPlus /> CRIAR EVENTO
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold font-mono tracking-widest text-slate-200 uppercase">
            PAINEL DE EVENTOS
          </h2>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-2 pb-20 flex flex-col gap-2">
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-40 border border-dashed border-slate-700 bg-slate-900/30 text-slate-500 font-mono text-sm uppercase">
            Nenhum evento ativo
          </div>
        ) : (
          categories.map(({ type, label }) => {
            const typeEvents = groupedEvents[type];
            if (!typeEvents || typeEvents.length === 0) return null;

            return (
              <HardwareAccordion
                key={type}
                title={label}
                count={typeEvents.length}
                colorTheme={EVENT_COLORS[type]}
                defaultOpen={true}
              >
                <div className="grid grid-flow-col auto-cols-[85vw] md:auto-cols-[380px] grid-rows-1 gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory md:snap-none">
                  {typeEvents.map((ev) => (
                    <div key={ev.id} className="snap-start min-h-full">
                      {renderEvent(ev)}
                    </div>
                  ))}
                </div>
              </HardwareAccordion>
            );
          })
        )}
      </div>

      {renderModals()}
    </div>
  );
}
