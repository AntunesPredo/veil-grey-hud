import React, { useState } from "react";
import { useNetworkStore } from "../../../shared/store/useNetworkStore";
import { Button } from "../../../shared/ui/Form";
import { Accordion } from "../../../shared/ui/Accordion";
import { InventoryZoneV2 } from "../../inventory/components/InventoryZoneV2";
import type {
  CustomEffect,
  Item,
  Disadvantage,
} from "../../../shared/types/veil-grey";
import { useMasterStore } from "../masterStore";
import { useCharacterStore } from "../../character/store";
import { useDisclosure } from "../../../shared/hooks/useDisclosure";
import { ItemModal } from "../../item-modal/ItemModal";
import { ConfirmModal, Modal } from "../../../shared/ui/Overlays";
import { RetroToast } from "../../../shared/ui/RetroToast";
import { motion, AnimatePresence } from "framer-motion";

export interface PlayerTelemetry {
  hp: { current: number; max: number; temp: number };
  insanity: { current: number; max: number };
  energy: { current: number; max: number; state: string };
  sustenance: { current: number; max: number; state: string };
  attributes: Record<string, number>;
  secondaryAttributes: Record<string, number>;
  skills: Record<string, number>;
  effects: CustomEffect[];
  customEffectIds: number[];
  inventory: Item[];
  disadvantages: Disadvantage[];
}

export const PlayerCard = React.memo(
  ({ playerName, isNpc }: { playerName: string; isNpc?: boolean }) => {
    const data = useNetworkStore((state) => state.telemetryData[playerName]);
    const sendPayload = useNetworkStore((state) => state.sendPayload);
    const isOnline = useNetworkStore((state) =>
      state.onlinePlayers.includes(playerName),
    );
    
    // In master mode, we use `useMasterStore` to check if a local NPC is active
    const localNpcData = useMasterStore((state) =>
      state.npcs.find((n) => n.name === playerName),
    );
    const isLocalNpc = !!localNpcData && localNpcData.isActive;
    
    const hasPendingOverride = useMasterStore(
      (state) => !!state.pendingOverrides?.[playerName],
    );

    const isVisuallyOnline = isOnline || isLocalNpc;

    const itemModal = useDisclosure();
    const deleteModal = useDisclosure();
    const [isResendModalOpen, setIsResendModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [accordions, setAccordions] = useState<Record<string, boolean>>({
      stats: false,
      sec: false,
      effects: false,
      inventory: false,
      flaws: false,
    });

    const toggleAccordion = (key: string) => {
      if (key === "inventory") setEditMode(false);
      setAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleRemoveEffectRemote = (effectId: number) => {
      sendPayload(playerName, "REMOVE_EFFECT", { id: effectId });
    };

    const handlePossess = () => {
      const masterStore = useMasterStore.getState();
      const charStore = useCharacterStore.getState();

      if (!masterStore.masterBackup) {
        masterStore.setMasterBackup({ ...charStore });
      }

      const localNpc = masterStore.npcs.find((n) => n.name === playerName);

      if (localNpc) {
        charStore.importCharacterData({
          ...localNpc,
          isPossessing: playerName,
          isMasterMode: false,
        });
        RetroToast.warning(`ASSUMINDO CONTROLE DO NPC: ${playerName}`);
        return;
      }

      if (!data) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pureHp = { ...(data.vitals?.hp || {}) } as any;
      delete pureHp.max;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pureEnergy = { ...(data.vitals?.energy || {}) } as any;
      delete pureEnergy.max;
      delete pureEnergy.state;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pureSustenance = { ...(data.vitals?.sustenance || {}) } as any;
      delete pureSustenance.max;
      delete pureSustenance.state;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pureInsanity = { ...(data.vitals?.insanity || {}) } as any;
      delete pureInsanity.max;

      const hp = {
        current: pureHp.current ?? 65,
        baseMax: pureHp.baseMax ?? 65,
        temp: pureHp.temp ?? 0,
        maxBonus: pureHp.maxBonus ?? 0,
        isInjured: pureHp.isInjured ?? false,
        isVeryInjured: pureHp.isVeryInjured ?? false,
        autoApplyInjury: pureHp.autoApplyInjury ?? false,
      };

      const crisis = data.vitals?.crisis
        ? data.vitals?.crisis
        : { state: null, fails: 0, ignore: false };

      const mockState = {
        ...charStore,
        ...data.core,
        hp,
        energy: { current: pureEnergy.current ?? 8 },
        sustenance: { current: pureSustenance.current ?? 5 },
        insanity: {
          current: pureInsanity.current ?? 0,
          volatile: pureInsanity.volatile ?? false,
        },
        crisis,
        inventory: data.inventory || [],
        customEffects: data.effects || [],
        notes: data.notes?.notes || [],
        mainNote: data.notes?.mainNote || "",
        mainNoteHeight: data.notes?.mainNoteHeight ?? 200,
        role: data.core?.role ?? null,
        isPossessing: playerName,
        isMasterMode: false,
      };

      charStore.importCharacterData(mockState);
      RetroToast.warning(`ASSUMINDO CONTROLE DE: ${playerName}`);
    };

    const requestExport = () => {
      const localNpc = useMasterStore
        .getState()
        .npcs.find((n) => n.name === playerName);
      if (localNpc) {
        const payload = {
          vg_version: import.meta.env.VITE_APP_VERSION || "1.0.0",
          timestamp: new Date().toISOString(),
          data: localNpc,
        };
        import("crypto-js").then((CryptoJS) => {
          const encrypted = CryptoJS.default.AES.encrypt(
            JSON.stringify(payload),
            import.meta.env.VITE_SECRET_KEY || "fallback_veil_grey_key",
          ).toString();
          const dataUri =
            "data:text/plain;charset=utf-8," + encodeURIComponent(encrypted);
          const link = document.createElement("a");
          link.href = dataUri;
          link.download = `VG_NPC_${playerName}.json`;
          link.click();
          RetroToast.success(`FICHA DO NPC [${playerName}] EXPORTADA.`);
        });
      } else {
        const msg = {
          type: "broadcast" as const,
          event: "MASTER_COMMAND",
          payload: {
            target: playerName,
            command: "EXPORT_REQUEST",
            attackerName: "MESTRE",
          },
        };
        const channel = useNetworkStore.getState().telemetryChannel;
        if (channel) {
          if (typeof (channel as any).httpSend === "function") {
            (channel as any).httpSend(msg.event, msg.payload).catch(console.error);
          } else {
            channel.send(msg);
          }
        }
        RetroToast.info(`SOLICITANDO EXPORTAÇÃO DA FICHA DE ${playerName}...`);
      }
    };

    const handleResendOverride = () => {
      const diff = useMasterStore.getState().pendingOverrides?.[playerName];
      if (diff) {
        const channel = useNetworkStore.getState().telemetryChannel;
        if (channel) {
          const msg = {
            type: "broadcast" as const,
            event: "MASTER_COMMAND",
            payload: {
              target: playerName,
              command: "FULL_OVERRIDE",
              data: diff,
              attackerName: "MESTRE",
            },
          };
          if (typeof channel.httpSend === "function") {
            channel.httpSend(msg.event, msg.payload).catch(console.error);
          } else {
            channel.send(msg);
          }
          RetroToast.success("ALTERAÇÕES REENVIADAS.");
        }
      }
    };

    // Component Rendering
    const borderColor = isVisuallyOnline ? (isNpc ? "var(--theme-warning)" : "var(--theme-success)") : "var(--theme-border)";
    const bgHeader = isVisuallyOnline ? (isNpc ? "bg-[var(--theme-warning)]" : "bg-[var(--theme-success)]") : "bg-[var(--theme-border)]";
    const textHeader = isVisuallyOnline ? "text-black font-black" : "text-[var(--theme-text)] font-bold";

    const HeaderButtons = () => (
      <div className="flex gap-1.5 items-center">
        <Button
          size="sm"
          className={`h-5 py-0 px-2 text-[9px] rounded-none font-black ${isVisuallyOnline ? "bg-black/20 hover:bg-black/40 text-white border-black/20 border" : "bg-black/40 hover:bg-white/10 text-white border-white/20 border"}`}
          onClick={handlePossess}
        >
          POSSUIR
        </Button>
        <Button
          size="sm"
          className={`h-5 py-0 px-2 text-[9px] rounded-none font-black ${isVisuallyOnline ? "bg-black/20 hover:bg-black/40 text-white border-black/20 border" : "bg-black/40 hover:bg-white/10 text-white border-white/20 border"}`}
          onClick={requestExport}
        >
          EXP
        </Button>

        {!isLocalNpc && (
          <>
            {hasPendingOverride && (
              <Button
                size="sm"
                variant="danger"
                className="h-5 py-0 px-2 text-[9px] animate-pulse border-dashed rounded-none"
                onClick={() => setIsResendModalOpen(true)}
                title="Existem alterações pendentes não assimiladas pelo jogador."
              >
                REENVIAR ALT.
              </Button>
            )}
            <Button
              size="sm"
              className={`h-5 py-0 px-2 text-[9px] rounded-none font-black ${isVisuallyOnline ? "bg-black/20 hover:bg-black/40 text-white border-black/20 border" : "bg-[var(--theme-warning)]/20 hover:bg-[var(--theme-warning)] text-white hover:text-white border-[var(--theme-warning)]/50 border"}`}
              onClick={() =>
                useNetworkStore.getState().forceSyncPlayer(playerName)
              }
            >
              SYNC
            </Button>
            <Button
              size="sm"
              className={`h-5 py-0 px-2 text-[9px] rounded-none font-black ${isVisuallyOnline ? "bg-[var(--theme-danger)]/80 hover:bg-[var(--theme-danger)] text-white border-black/20 border" : "bg-[var(--theme-danger)]/20 hover:bg-[var(--theme-danger)] text-white hover:text-white border-[var(--theme-danger)]/50 border"}`}
              onClick={() =>
                useNetworkStore.getState().kickPlayer(playerName)
              }
            >
              KICK
            </Button>
          </>
        )}
      </div>
    );

    // If data is missing (still loading telemetry domains)
    if (!data || !data.core || !data.vitals) {
      return (
        <div className={`border-2 flex flex-col relative group transition-all duration-300 ${!isVisuallyOnline ? "opacity-60 grayscale" : "shadow-[0_0_15px_rgba(0,0,0,0.3)]"}`} style={{ borderColor }}>
          {/* Header */}
          <div className={`border-b-2 px-3 py-1.5 uppercase text-xs flex justify-between items-center ${bgHeader} ${textHeader}`} style={{ borderColor }}>
            <div className="flex flex-col">
              <span className="truncate max-w-[150px] sm:max-w-[200px] text-sm leading-tight">{playerName}</span>
              <span className="text-[9px] opacity-70 tracking-widest font-mono">
                {isVisuallyOnline ? "ONLINE" : "OFFLINE"} | {isNpc ? "NPC" : "PC"}
              </span>
            </div>
            <HeaderButtons />
          </div>
          {/* Body */}
          <div className="p-6 flex items-center justify-center bg-[var(--theme-background)] bg-opacity-90 backdrop-blur min-h-[120px]">
             <span className="text-xs font-mono text-[var(--theme-text)]/40 italic uppercase animate-pulse">
                [ AGUARDANDO SINCRONIZAÇÃO DE DOMÍNIOS... ]
             </span>
          </div>
        </div>
      );
    }

    const { core, vitals, inventory, effects, customEffectIds } = data;
    const isLevelingUp = core.creationStatus === "LEVEL_UP" || core.creationStatus === "STARTED";

    return (
      <div
        className={`border-2 flex flex-col relative group transition-all duration-300 rounded-none ${!isVisuallyOnline ? "opacity-60 grayscale" : "shadow-[0_0_15px_rgba(0,0,0,0.3)]"} ${!isLocalNpc ? "bg-[var(--theme-background)]" : "bg-black/20 backdrop-blur"}`}
        style={{ borderColor }}
      >
        {/* Animated Level Up Overlay */}
        <AnimatePresence>
          {isLevelingUp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none z-10 border-4 border-[var(--theme-success)] border-dashed animate-pulse flex items-center justify-center overflow-hidden"
            >
              <div className="rotate-[-10deg] bg-[var(--theme-success)] text-black px-8 py-2 font-black tracking-widest uppercase text-xl shadow-[0_0_30px_var(--theme-success)] whitespace-nowrap">
                {core.creationStatus === "LEVEL_UP" ? "LEVEL UP / EVOLUÇÃO" : "CRIAÇÃO DE UNIDADE"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card Header (Blade Style) */}
        <div className={`border-b-2 px-3 py-1.5 uppercase text-xs flex justify-between items-center ${bgHeader} ${textHeader}`} style={{ borderColor }}>
          <div className="flex flex-col">
            <span className="truncate max-w-[150px] sm:max-w-[200px] text-sm leading-tight">{playerName}</span>
            <span className="text-[9px] opacity-70 tracking-widest font-mono mt-0.5">
               {isNpc ? "NON-PLAYER ENTITY" : `LVL ${core.level || 0} | ${core.role?.title || "SEM FUNÇÃO"}`}
            </span>
          </div>
          <HeaderButtons />
        </div>

        <div className="flex flex-col relative z-0">
          {/* Vitals Grid */}
          <div className="p-3 grid grid-cols-2 gap-3 text-[10px] font-mono border-b border-[var(--theme-border)] bg-black/40 backdrop-blur">
            <div className="flex flex-col border border-[var(--theme-accent)]/30 p-2 bg-[var(--theme-background)]/50">
              <span className="text-[var(--theme-text)]/60 font-bold mb-1 tracking-widest">
                HP_CAPACITY
              </span>
              <span className="text-lg font-black text-[var(--theme-accent)] leading-none">
                {vitals.hp.current} <span className="text-xs text-[var(--theme-text)]/50 font-normal">/ {vitals.hp.max}</span>
                {vitals.hp.temp > 0 && (
                  <span className="text-[var(--theme-success)] text-xs ml-1 font-bold">
                    (+{vitals.hp.temp})
                  </span>
                )}
              </span>
            </div>
            
            <div className="flex flex-col border border-[var(--theme-warning)]/30 p-2 bg-[var(--theme-background)]/50">
              <span className="text-[var(--theme-warning)]/60 font-bold mb-1 tracking-widest">
                PSY_INSANITY
              </span>
              <span className="text-lg font-black text-[var(--theme-warning)] leading-none">
                {vitals.insanity.current} <span className="text-xs text-[var(--theme-warning)]/50 font-normal">/ {vitals.insanity.max}</span>
              </span>
            </div>
            
            <div className="flex flex-col border border-[var(--theme-success)]/30 p-2 bg-[var(--theme-background)]/50">
              <span className="text-[var(--theme-success)]/60 font-bold mb-1 tracking-widest flex justify-between items-center">
                PWR_ENERGY
                <span className="text-[8px] bg-[var(--theme-success)]/20 px-1 py-0.5 rounded-none border border-[var(--theme-success)]/50 text-[var(--theme-success)]">
                  {vitals.energy.state}
                </span>
              </span>
              <span className="text-lg font-black text-[var(--theme-success)] leading-none">
                {vitals.energy.current} <span className="text-xs text-[var(--theme-success)]/50 font-normal">/ {vitals.energy.max}</span>
              </span>
            </div>
            
            <div className="flex flex-col border border-[var(--theme-accent)]/30 p-2 bg-[var(--theme-background)]/50">
              <span className="text-[var(--theme-text)]/60 font-bold mb-1 tracking-widest flex justify-between items-center">
                METABOLISM
                <span className="text-[8px] bg-[var(--theme-accent)]/20 px-1 py-0.5 rounded-none border border-[var(--theme-accent)]/50 text-[var(--theme-accent)]">
                  {vitals.sustenance.state}
                </span>
              </span>
              <span className="text-lg font-black text-[var(--theme-accent)] leading-none">
                {vitals.sustenance.current} <span className="text-xs text-[var(--theme-accent)]/50 font-normal">/ {vitals.sustenance.max}</span>
              </span>
            </div>

            {!isNpc && (
              <div className="col-span-2 flex flex-col border border-[var(--theme-border)] p-2 bg-[var(--theme-background)]/50 mt-1">
                <div className="flex justify-between items-center mb-1 text-[10px] tracking-widest">
                  <span className="text-[var(--theme-text)]/60 font-bold">EXPERIENCE [XP]</span>
                  <span className="text-[var(--theme-success)] font-bold">{core.xp?.current} / {core.xp?.max}</span>
                </div>
                <div className="w-full h-1 bg-[var(--theme-background)] border border-[var(--theme-border)]">
                  <div 
                    className="h-full bg-[var(--theme-success)] shadow-[0_0_5px_var(--theme-success)]" 
                    style={{ width: `${Math.min(((core.xp?.current || 0) / (core.xp?.max || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Stats */}
          {!isNpc && core.secondaryAttributes && (
            <div className="p-2 grid grid-cols-3 gap-2 text-[10px] font-mono border-b border-[var(--theme-border)] bg-black/60 backdrop-blur">
              <div className="flex flex-col items-center border border-[var(--theme-accent)]/30 p-1.5 bg-[var(--theme-background)]/50">
                <span className="text-[var(--theme-text)]/60 font-bold mb-0.5 tracking-widest">AÇÕES</span>
                <span className="text-xl font-black text-[var(--theme-accent)]">{core.secondaryAttributes.actionPoints ?? 0}</span>
              </div>
              <div className="flex flex-col items-center border border-[var(--theme-warning)]/30 p-1.5 bg-[var(--theme-background)]/50">
                <span className="text-[var(--theme-text)]/60 font-bold mb-0.5 tracking-widest">REAÇÕES</span>
                <span className="text-xl font-black text-[var(--theme-warning)]">{core.secondaryAttributes.reactions ?? 0}</span>
              </div>
              <div className="flex flex-col items-center border border-[var(--theme-success)]/30 p-1.5 bg-[var(--theme-background)]/50">
                <span className="text-[var(--theme-text)]/60 font-bold mb-0.5 tracking-widest">MOVIMENTAÇÃO</span>
                <span className="text-xl font-black text-[var(--theme-success)]">{core.secondaryAttributes.movement ?? 0}</span>
              </div>
            </div>
          )}

          {/* Player Character Specific Details */}
          {!isNpc && (
            <div className="flex flex-col bg-[var(--theme-background)]">
              {/* Primary Stats & Skills */}
              <Accordion
                title="SISTEMAS ESTATÍSTICOS (ATT/SKL)"
                isOpen={accordions.stats}
                onToggle={() => toggleAccordion("stats")}
              >
                <div className="grid grid-cols-2 gap-4 text-[10px] uppercase p-3 bg-transparent">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-bold text-[var(--theme-accent)] border-b border-[var(--theme-accent)]/30 pb-1 mb-1 tracking-widest">
                      ATRIBUTOS BASE
                    </span>
                    {Object.entries(core.attributes).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center group">
                        <span className="text-[var(--theme-text)]/70 group-hover:text-[var(--theme-text)] transition-colors">{key}</span>
                        <span className="text-[var(--theme-warning)] font-bold bg-[var(--theme-warning)]/10 px-1.5 py-0.5">{val}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="font-bold text-[var(--theme-accent)] border-b border-[var(--theme-accent)]/30 pb-1 mb-1 tracking-widest">
                      PERÍCIAS ATIVAS
                    </span>
                    {Object.entries(core.skills)
                      .filter(([, val]) => val > 0)
                      .map(([key, val]) => (
                        <div key={key} className="flex justify-between items-center group">
                          <span className="truncate text-[var(--theme-text)]/70 pr-2 group-hover:text-[var(--theme-text)] transition-colors">
                            {key}
                          </span>
                          <span className="text-[var(--theme-success)] font-bold bg-[var(--theme-success)]/10 px-1.5 py-0.5">{val}</span>
                        </div>
                      ))}
                      {Object.values(core.skills).every(v => v === 0) && (
                        <span className="text-[9px] text-[var(--theme-text)]/30 italic">NENHUMA PERÍCIA ATIVA.</span>
                      )}
                  </div>
                </div>
              </Accordion>

              {/* Secondary Stats */}
              <Accordion
                title="ATRIBUTOS SECUNDÁRIOS"
                isOpen={accordions.sec}
                onToggle={() => toggleAccordion("sec")}
              >
                <div className="grid grid-cols-2 gap-3 p-3 bg-transparent text-[10px] font-mono">
                  {Object.entries(core.secondaryAttributes).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center border-b border-[var(--theme-border)] border-dashed pb-1">
                      <span className="text-[var(--theme-text)]/60">{key.replace("_", " ")}:</span>
                      <span className="text-[var(--theme-accent)] font-bold">{val}</span>
                    </div>
                  ))}
                </div>
              </Accordion>

              {/* Effects */}
              {effects !== undefined && (
                <Accordion
                  title={`MODIFICADORES APLICADOS (${effects?.length ?? 0})`}
                  isOpen={accordions.effects}
                  onToggle={() => toggleAccordion("effects")}
                >
                  <div className="flex flex-col gap-2 p-3 bg-transparent max-h-[220px] overflow-y-auto custom-scrollbar">
                    {effects.map((eff) => {
                      const isRemovable = (customEffectIds ?? []).includes(eff.id);
                      const valColor = eff.val > 0
                        ? "text-[var(--theme-success)]"
                        : eff.val < 0
                          ? "text-[var(--theme-danger)]"
                          : "text-[var(--theme-accent)]";

                      return (
                        <div key={eff.id} className="flex justify-between items-center border border-[var(--theme-border)] bg-[var(--theme-background)] p-2 relative overflow-hidden group">
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${eff.val > 0 ? "bg-[var(--theme-success)]" : eff.val < 0 ? "bg-[var(--theme-danger)]" : "bg-[var(--theme-accent)]"}`} />
                          <div className="flex flex-col min-w-0 pr-2 pl-2">
                            <span className={`text-[10px] uppercase font-mono font-bold ${valColor} truncate`}>
                              {eff.description}
                            </span>
                            <span className="text-[8px] uppercase font-mono text-[var(--theme-text)]/50 mt-0.5">
                              TGT: {eff.target} | MODE: {eff.mode}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`font-mono font-black text-sm ${valColor} bg-black/30 px-2 py-0.5`}>
                              {eff.val > 0 ? `+${eff.val}` : eff.val}
                            </span>
                            {isRemovable ? (
                              <Button
                                variant="danger"
                                size="sm"
                                className="h-6 w-6 p-0 flex items-center justify-center border-none text-[10px] hover:scale-110 transition-transform rounded-none"
                                onClick={() => handleRemoveEffectRemote(eff.id)}
                              >
                                ✕
                              </Button>
                            ) : (
                              <div className="h-6 w-6 flex items-center justify-center opacity-20" title="Efeito fixo (Sistema/Item)">
                                <svg className="w-3.5 h-3.5 fill-current text-[var(--theme-text)]" viewBox="0 0 24 24">
                                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {(effects?.length ?? 0) === 0 && (
                      <span className="text-[10px] text-[var(--theme-text)]/30 italic uppercase text-center block py-4 font-mono">
                        NENHUMA INJEÇÃO DE DADOS DETECTADA.
                      </span>
                    )}
                  </div>
                </Accordion>
              )}

              {/* Inventory */}
              {inventory !== undefined && (
                <Accordion
                  title={`INVENTÁRIO (${inventory.length})`}
                  isOpen={accordions.inventory}
                  onToggle={() => toggleAccordion("inventory")}
                >
                  <div className="p-3 bg-transparent flex flex-col gap-4 border-t border-[var(--theme-border)]">
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant={editMode ? "danger" : "primary"}
                        onClick={() => setEditMode((prev) => !prev)}
                        className="text-[9px] rounded-none text-white"
                      >
                        {editMode ? "[ MODO EDIÇÃO: ATIVO ]" : "HABILITAR EDIÇÃO"}
                      </Button>
                    </div>
                    
                    <div className="border border-[var(--theme-border)] p-2 bg-[var(--theme-background)]/40">
                      <InventoryZoneV2
                        zoneId={`master_view_${playerName}_carried`}
                        title="EQUIPADO / CARREGADO"
                        items={inventory.filter((i) => i.isCarried && i.parentId === null)}
                        allInventory={inventory}
                        isEditMode={editMode}
                        onToggleEquip={() => {}}
                        onEdit={(i) => {
                          setSelectedItem(i);
                          itemModal.onOpen();
                        }}
                        onDelete={(i) => {
                          setSelectedItem(i);
                          deleteModal.onOpen();
                        }}
                      />
                    </div>
                    
                    <div className="border border-[var(--theme-border)] p-2 bg-[var(--theme-background)]/40">
                      <InventoryZoneV2
                        zoneId={`master_view_${playerName}_base`}
                        title="NA BASE"
                        items={inventory.filter((i) => !i.isCarried && i.parentId === null)}
                        allInventory={inventory}
                        isEditMode={editMode}
                        onToggleEquip={() => {}}
                        onEdit={(i) => {
                          setSelectedItem(i);
                          itemModal.onOpen();
                        }}
                        onDelete={(i) => {
                          setSelectedItem(i);
                          deleteModal.onOpen();
                        }}
                      />
                    </div>
                  </div>
                  <ItemModal
                    isOpen={itemModal.isOpen}
                    onClose={itemModal.onClose}
                    itemToEdit={selectedItem}
                    onSaveOverride={(newItem) => {
                      if (isLocalNpc) {
                        const npc = useMasterStore.getState().npcs.find((n) => n.name === playerName);
                        if (npc) {
                          const newInv = (npc.inventory || []).map((i) => (i.id === newItem.id ? newItem : i));
                          useMasterStore.getState().updateNpcData(npc.id, { inventory: newInv });
                        }
                      } else {
                        const msg = {
                          type: "broadcast" as const,
                          event: "MASTER_COMMAND",
                          payload: {
                            target: playerName,
                            command: "FORCE_UPDATE_ITEM",
                            data: newItem,
                          },
                        };
                        const channel = useNetworkStore.getState().telemetryChannel;
                        if (channel) {
                          if (typeof channel.httpSend === "function") {
                            channel.httpSend(msg.event, msg.payload).catch(console.error);
                          } else {
                            channel.send(msg);
                          }
                        }
                      }
                      itemModal.onClose();
                      RetroToast.success("ATUALIZAÇÃO DE ITEM ENVIADA.");
                    }}
                  />
                  <ConfirmModal
                    isOpen={deleteModal.isOpen}
                    onClose={deleteModal.onClose}
                    title="CONFIRMAR DESTRUIÇÃO"
                    message={
                      <div className="bg-black/50 p-3 border border-[var(--theme-danger)]/50 mt-2 text-left">
                        <span className="font-bold text-[var(--theme-danger)] block mb-1">
                          [{selectedItem?.name}]
                        </span>
                        <p className="text-[var(--theme-text)]/60 text-xs font-mono">
                          O item será apagado permanentemente. Caso possua itens internos, eles retornarão à raiz.
                        </p>
                      </div>
                    }
                    onConfirm={() => {
                      if (selectedItem) {
                        if (isLocalNpc) {
                          const npc = useMasterStore.getState().npcs.find((n) => n.name === playerName);
                          if (npc) {
                            const newInv = (npc.inventory || []).filter((i) => i.id !== selectedItem.id);
                            useMasterStore.getState().updateNpcData(npc.id, { inventory: newInv });
                          }
                        } else {
                          const msg = {
                            type: "broadcast" as const,
                            event: "MASTER_COMMAND",
                            payload: {
                              target: playerName,
                              command: "FORCE_DELETE_ITEM",
                              data: { id: selectedItem.id },
                            },
                          };
                          const channel = useNetworkStore.getState().telemetryChannel;
                          if (channel) {
                            if (typeof channel.httpSend === "function") {
                              channel.httpSend(msg.event, msg.payload).catch(console.error);
                            } else {
                              channel.send(msg);
                            }
                          }
                        }
                      }
                      deleteModal.onClose();
                      RetroToast.success("EXCLUSÃO DE ITEM ENVIADA.");
                    }}
                    isDanger
                  />
                </Accordion>
              )}

              {/* Flaws / Disadvantages */}
              <Accordion
                title={`ANOMALIAS E DESVANTAGENS (${core.disadvantages.length})`}
                isOpen={accordions.flaws}
                onToggle={() => toggleAccordion("flaws")}
              >
                <div className="flex flex-col gap-3 p-3 bg-transparent max-h-[200px] overflow-y-auto custom-scrollbar">
                  {core.disadvantages.map((flaw) => (
                    <div key={flaw.id} className="flex flex-col border-l-2 border-[var(--theme-danger)] pl-3 py-1 bg-black/40">
                      <span className="text-[11px] font-bold text-[var(--theme-danger)] uppercase tracking-widest">
                        {flaw.title}
                      </span>
                      <span className="text-[10px] text-[var(--theme-text)]/70 italic uppercase mt-1 leading-relaxed">
                        {flaw.description}
                      </span>
                    </div>
                  ))}
                  {core.disadvantages.length === 0 && (
                    <span className="text-[10px] text-[var(--theme-text)]/40 italic uppercase text-center block py-4 font-mono">
                      NENHUMA ANOMALIA DETECTADA NO GENOMA.
                    </span>
                  )}
                </div>
              </Accordion>
            </div>
          )}
        </div>

        <Modal
          isOpen={isResendModalOpen}
          onClose={() => setIsResendModalOpen(false)}
          title="GERENCIAR MUDANÇAS PENDENTES"
          isDanger
          maxWidth="max-w-md"
        >
          <div className="flex flex-col gap-4 text-center">
            <div className="bg-black/50 p-3 border border-[var(--theme-danger)]/50 text-left">
              <span className="font-bold text-[var(--theme-danger)] block mb-1 uppercase text-sm tracking-widest">
                FILA DE TELEMETRIA
              </span>
              <p className="text-[var(--theme-text)]/60 text-xs font-mono">
                Existem alterações locais neste personagem que ainda não foram recebidas pelo cliente do jogador. Como deseja prosseguir?
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="primary"
                onClick={() => {
                  handleResendOverride();
                  setIsResendModalOpen(false);
                }}
                className="w-full flex items-center justify-center border-dashed py-3"
              >
                REENVIAR MUDANÇAS (FORCE PUSH)
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  useMasterStore.getState().removePendingOverride(playerName);
                  setIsResendModalOpen(false);

                  const channel = useNetworkStore.getState().telemetryChannel;
                  if (channel) {
                    const msg = {
                      type: "broadcast" as const,
                      event: "MASTER_COMMAND",
                      payload: {
                        target: playerName,
                        command: "CANCEL_OVERRIDE",
                        attackerName: "MESTRE",
                      },
                    };
                    if (typeof (channel as any).httpSend === "function") {
                      (channel as any).httpSend(msg.event, msg.payload).catch(console.error);
                    } else {
                      channel.send(msg);
                    }
                  }

                  RetroToast.info("MUDANÇAS DESCARTADAS LOCALMENTE.");
                }}
                className="w-full flex items-center justify-center border-dashed py-3"
              >
                EXCLUIR MUDANÇAS
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  },
);
