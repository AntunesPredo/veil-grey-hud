import { useState } from "react";
import { useEventsStore } from "./store/useEventsStore";
import { useMasterEventsStore } from "./store/useMasterEventsStore";
import { TestEventCard } from "./components/modules/TestEventCard";
import { MarketEventCard } from "./components/modules/MarketEventCard";
import { MerchantEventCard } from "./components/modules/MerchantEventCard";
import { JobsEventCard } from "./components/modules/JobsEventCard";
import { DebtsEventCard } from "./components/modules/DebtsEventCard";
import { P2PTransferCard } from "./components/modules/P2PTransferCard";
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
import { RetroToast } from "../../shared/ui/RetroToast";

interface EventsTabProps {
  isMaster?: boolean;
}

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

  const events = isMaster ? masterEvents : playerEvents;

  const EVENT_COLORS: Record<EventType, string> = {
    TEST: "border-indigo-500",
    MARKET: "border-emerald-500",
    MERCHANT: "border-amber-500",
    JOB: "border-cyan-500",
    DEBT: "border-red-500",
    P2P_TRANSFER: "border-purple-500",
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

  const handlePush = (event: GameEvent) => {
    useNetworkStore.getState().sendPayload("ALL", "EVENT_SYNC", { action: "UPSERT", event });
  };

  const renderEvent = (event: GameEvent) => {
    const colorTheme = EVENT_COLORS[event.type] || "border-slate-800";
    const cardProps = {
      event,
      isMaster,
      onEdit: () => handleEdit(event),
      onDelete: () => handleDelete(event.id),
      onPush: () => handlePush(event),
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
            onAccept={() => {
              useNetworkStore.getState().sendPayload("MESTRE", "EVENT_ACTION", {
                eventId: event.id,
                action: "ACCEPT_JOB",
                characterId
              });
              RetroToast.success("EMPREGO ACEITO! Aguardando pagamento.");
            }}
            onReject={() => {
              RetroToast.warning("EMPREGO RECUSADO.");
            }}
            onPayWorkers={() => {
              useNetworkStore.getState().sendPayload("MESTRE", "EVENT_ACTION", {
                eventId: event.id,
                action: "PAY_WORKERS"
              });
            }}
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
      default:
        return null;
    }
  };

  if (!isMaster) {
    if (events.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 font-mono text-sm">
          NENHUM EVENTO ATIVO
        </div>
      );
    }
    
    return (
      <div className="flex flex-col gap-4 p-2 relative h-full">
        {events.map((ev) => renderEvent(ev))}
      </div>
    );
  }

  // Master View
  
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
  ];

  return (
    <div className="flex flex-col p-4 h-full relative">
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold font-mono tracking-widest text-slate-200 uppercase">
            PAINEL DE EVENTOS
          </h2>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-2 pb-20 flex flex-col gap-6">
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-40 border border-dashed border-slate-700 bg-slate-900/30 text-slate-500 font-mono text-sm uppercase">
            Nenhum evento criado
          </div>
        ) : (
          categories.map(({ type, label }) => {
            const typeEvents = groupedEvents[type];
            if (!typeEvents || typeEvents.length === 0) return null;
            
            return (
              <div key={type} className="flex flex-col">
                <div className={`flex items-center gap-3 mb-4 border-b ${EVENT_COLORS[type]} pb-2`}>
                  <h3 className={`font-bold uppercase tracking-widest ${EVENT_COLORS[type].replace("border-", "text-")}`}>
                    {label}
                  </h3>
                  <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded font-mono">
                    {typeEvents.length}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {typeEvents.map((ev) => renderEvent(ev))}
                </div>
              </div>
            );
          })
        )}
      </div>

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
          event={debtPaymentEvent}
        />
      )}
      {p2pPaymentEvent && (
        <P2PPaymentModal
          isOpen={!!p2pPaymentEvent}
          onClose={() => setP2pPaymentEvent(undefined)}
          event={p2pPaymentEvent}
        />
      )}
      {p2pHostManageEvent && (
        <P2PHostManageModal
          isOpen={!!p2pHostManageEvent}
          onClose={() => setP2pHostManageEvent(undefined)}
          event={p2pHostManageEvent}
          isMaster={isMaster}
        />
      )}
      {marketPurchaseEvent && (
        <MarketPurchaseModal
          isOpen={!!marketPurchaseEvent}
          onClose={() => setMarketPurchaseEvent(undefined)}
          event={marketPurchaseEvent}
        />
      )}
    </div>
  );
}
