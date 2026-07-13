import { useEffect, useState } from "react";
import { useNetworkStore } from "../../shared/store/useNetworkStore";
import { Button } from "../../shared/ui/Form";
import { HashGeneratorModal } from "../progression/HashGeneratorModal";
import { PlayerTrackerTab } from "./PlayerTrackerTab";
import { MasterArsenalTab } from "./MasterArsenalTab";
import { MasterNpcTab } from "./MasterNpcTab";
import { EventsTab } from "../events/EventsTab";
import { SettingsModal } from "../progression/SettingsModal";
import { useDisclosure } from "../../shared/hooks/useDisclosure";
import { MasterQuickActionHeader } from "./components/MasterQuickActionHeader";
import { AttributeDrawer } from "../stats/AttributeDrawer";
import { SkillDrawer } from "../stats/SkillDrawer";
import { RollResolverModal } from "../stats/RollResolverModal";
import { VitalsResolutionModal } from "../vitals/VitalsResolutionModal";
import { CombatDefenseModal } from "../vitals/CombatDefenseModal";
import { InsanityTransactionModal } from "../vitals/InsanityTransactionModal";
import { SustenanceTransactionModal } from "../vitals/SustenanceTransactionModal";
import { MasterNetworkQueueManager } from "./components/MasterNetworkQueueManager";
import { useMasterStore } from "./masterStore";
import { useUIStore } from "../../shared/store/useUIStore";
import { usePossessionSync } from "../character/usePossessionSync";
import { useCharacterStore, getBlankCharacterData } from "../character/store";

export function MasterHud() {
  usePossessionSync();
  const [activeTab, setActiveTab] = useState<
    "TRACKER" | "ARSENAL" | "PERSONAS" | "EVENTS"
  >("TRACKER");
  const [isHashModalOpen, setHashModalOpen] = useState(false);
  const settingsModal = useDisclosure();
  const activeQuickActionNpcId = useMasterStore((state) => state.activeQuickActionNpcId);
  const npcs = useMasterStore((state) => state.npcs);

  useEffect(() => {
    const charStore = useCharacterStore.getState();
    if (!charStore.isPossessing && !activeQuickActionNpcId && charStore.name !== "MESTRE") {
      charStore.importCharacterData({
        ...getBlankCharacterData(),
        name: "MESTRE",
        isMasterMode: true,
        creationStatus: "CLOSED",
      });
    }
  }, [activeQuickActionNpcId]);

  useEffect(() => {
    const activeNpcs = npcs.filter((n) => n.isActive).map((n) => ({ name: n.name, isEnemy: n.isEnemy }));
    const activeNpcNames = activeNpcs.map((n) => n.name);
    useNetworkStore.getState().setLocalNpcNames(activeNpcNames);
    useNetworkStore.getState().syncNpcs(activeNpcs);
  }, [npcs]);

  useEffect(() => {
    const uiStore = useUIStore.getState();
    uiStore.setDrawerState("left", { isPinned: false, isOpen: false });
    uiStore.setDrawerState("right", { isPinned: false, isOpen: false });
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-[var(--theme-background)] text-[var(--theme-accent)] font-mono p-4 gap-4 overflow-hidden relative">
      <MasterQuickActionHeader />
      {activeQuickActionNpcId && (
        <>
          <AttributeDrawer />
          <SkillDrawer />
        </>
      )}
      <RollResolverModal />
      <VitalsResolutionModal />
      <CombatDefenseModal />
      <InsanityTransactionModal />
      <SustenanceTransactionModal />
      <MasterNetworkQueueManager />
      <header className="flex justify-between items-center border-b-2 border-[var(--theme-danger)] pb-2 shrink-0 bg-[var(--theme-background)] z-10">
        <div className="flex flex-col">
          <span className="text-3xl font-black tracking-widest uppercase text-[var(--theme-danger)] glow-danger">
            SYS.OVERSEER
          </span>
          <span className="text-[10px] text-[var(--theme-text)]/70 uppercase tracking-widest">
            ACESSO CONCEDIDO.
          </span>
        </div>

        <div className="flex gap-4 items-center">
          <Button
            variant="warning"
            className="border-dashed h-10"
            onClick={() => setHashModalOpen(true)}
          >
            [ GERADOR DE HASH ]
          </Button>
          <Button
            size="sm"
            onClick={settingsModal.onOpen}
            className="w-full h-10 md:w-10 flex items-center justify-center p-0 shrink-0 border-[var(--theme-border)] hover:border-[var(--theme-accent)] bg-[var(--theme-background)]"
            title="Configurações"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
            </svg>
            <span className="md:hidden ml-2 text-[10px] font-bold tracking-widest">
              CONFIGURAÇÕES
            </span>
          </Button>
        </div>
      </header>

      <SettingsModal
        isOpen={settingsModal.isOpen}
        onClose={settingsModal.onClose}
      />

      <div className="flex gap-2 shrink-0 flex-wrap">
        <Button
          variant={activeTab === "TRACKER" ? "danger" : "primary"}
          className="flex-1"
          onClick={() => setActiveTab("TRACKER")}
        >
          TELEMETRIA
        </Button>
        <Button
          variant={activeTab === "ARSENAL" ? "danger" : "primary"}
          className="flex-1"
          onClick={() => setActiveTab("ARSENAL")}
        >
          ARSENAL
        </Button>
        <Button
          variant={activeTab === "PERSONAS" ? "danger" : "primary"}
          className="flex-1"
          onClick={() => setActiveTab("PERSONAS")}
        >
          PERSONAS
        </Button>
        <Button
          variant={activeTab === "EVENTS" ? "danger" : "primary"}
          className="flex-1"
          onClick={() => setActiveTab("EVENTS")}
        >
          EVENTOS
        </Button>
      </div>

      <div className="flex-1 overflow-hidden border-2 border-[var(--theme-border)] bg-[#030303] p-4 flex flex-col">
        {activeTab === "TRACKER" && <PlayerTrackerTab />}
        {activeTab === "ARSENAL" && <MasterArsenalTab />}
        {activeTab === "PERSONAS" && <MasterNpcTab />}
        {activeTab === "EVENTS" && <EventsTab isMaster={!activeQuickActionNpcId} />}
      </div>

      <HashGeneratorModal
        isOpen={isHashModalOpen}
        onClose={() => setHashModalOpen(false)}
      />
    </div>
  );
}
