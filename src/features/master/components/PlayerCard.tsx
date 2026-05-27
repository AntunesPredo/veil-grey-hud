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
import { ConfirmModal } from "../../../shared/ui/Overlays";
import { RetroToast } from "../../../shared/ui/RetroToast";

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
  ({ playerName }: { playerName: string }) => {
    const data = useNetworkStore((state) => state.telemetryData[playerName]);
    const sendPayload = useNetworkStore((state) => state.sendPayload);
    const isOnline = useNetworkStore((state) =>
      state.onlinePlayers.includes(playerName),
    );
    const isLocalNpc = useMasterStore((state) =>
      state.npcs.some((n) => n.name === playerName && n.isActive),
    );

    const isVisuallyOnline = isOnline || isLocalNpc;

    const itemModal = useDisclosure();
    const deleteModal = useDisclosure();

    const [editMode, setEditMode] = useState(false);

    const [selectedItem, setSelectedItem] = useState<Item | null>(null);

    const [accordions, setAccordions] = useState<Record<string, boolean>>({
      stats: false,
      sec: false,
      effects: false,
      inventory: false,
      flaws: false,
    });

    if (!data || !data.core || !data.vitals) {
      return (
        <div
          className={`border-2 border-[var(--theme-border)] bg-[var(--theme-background)] flex flex-col ${!isVisuallyOnline ? "opacity-70 grayscale" : ""}`}
        >
          <div className="border-b-2 p-2 flex justify-between items-center bg-[var(--theme-border)]/50 border-[var(--theme-border)]">
            <span className="font-black tracking-widest uppercase text-[var(--theme-text)]/50">
              UNIT: {playerName}
            </span>
          </div>
          <div className="p-4 text-xs font-mono text-[var(--theme-text)]/40 italic uppercase">
            [ AGUARDANDO SINCRONIZAÇÃO DE DOMÍNIOS... ]
          </div>
        </div>
      );
    }

    const { core, vitals, inventory, effects, customEffectIds } = data;

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

      masterStore.setMasterBackup({ ...charStore });

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
      const hp = {
        current: data.vitals?.hp.current ?? 65,
        baseMax: data.vitals?.hp.baseMax ?? 65,
        temp: data.vitals?.hp.temp ?? 65,
        maxBonus: data.vitals?.hp.max ?? 0,
        isInjured: data.vitals?.hp.isInjured ?? false,
        isVeryInjured: data.vitals?.hp.isVeryInjured ?? false,
        autoApplyInjury: data.vitals?.hp.autoApplyInjury ?? false,
      };

      const crisis = data.vitals?.crisis
        ? data.vitals?.crisis
        : {
            state: null,
            fails: 0,
            ignore: false,
          };

      const mockState = {
        ...charStore,
        ...data.core,
        hp,
        energy: { current: data.vitals?.energy.current ?? 8 },
        sustenance: { current: data.vitals?.sustenance.current ?? 5 },
        insanity: {
          current: data.vitals?.insanity.current ?? 0,
          volatile: data.vitals?.insanity.volatile ?? false,
        },
        crisis,
        inventory: data.inventory || [],
        customEffects: data.effects || [],
        notes: data.notes?.notes || [],
        mainNote: data.notes?.mainNote || "",
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
        sendPayload(playerName, "MASTER_COMMAND", {
          command: "EXPORT_REQUEST",
        });
        RetroToast.info(`SOLICITANDO EXPORTAÇÃO DA FICHA DE ${playerName}...`);
      }
    };

    return (
      <div
        className={`border-2 border-[var(--theme-border)] bg-[var(--theme-background)] flex flex-col transition-opacity ${!isVisuallyOnline ? "opacity-70 grayscale" : ""}`}
      >
        <div
          className={`border-b-2 p-2 flex justify-between items-center shrink-0 ${isVisuallyOnline ? "bg-[var(--theme-danger)]/10 border-[var(--theme-danger)]" : "bg-[var(--theme-border)]/50 border-[var(--theme-border)]"}`}
        >
          <span
            className={`font-black tracking-widest uppercase ${isVisuallyOnline ? "text-[var(--theme-danger)]" : "text-[var(--theme-text)]/50"}`}
          >
            UNIT: {playerName}
          </span>
          <div className="flex gap-2 items-center">
            <Button
              size="sm"
              variant="success"
              className="h-5 py-0 text-[9px]"
              onClick={handlePossess}
              disabled
            >
              POSSUIR
            </Button>
            <Button
              size="sm"
              variant="primary"
              className="h-5 py-0 text-[9px]"
              onClick={requestExport}
            >
              EXPORTAR
            </Button>

            {!isLocalNpc && (
              <>
                <Button
                  size="sm"
                  variant="warning"
                  className="h-5 py-0 text-[9px]"
                  onClick={() =>
                    useNetworkStore.getState().forceSyncPlayer(playerName)
                  }
                >
                  SYNC
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  className="h-5 py-0 text-[9px]"
                  onClick={() =>
                    useNetworkStore.getState().kickPlayer(playerName)
                  }
                >
                  KICK
                </Button>
              </>
            )}
            <span
              className={`text-[10px] text-black px-2 py-0.5 font-bold ${isVisuallyOnline ? "bg-[var(--theme-success)] animate-pulse" : "bg-[var(--theme-text)]/50"}`}
            >
              {isVisuallyOnline ? "ON-LINK" : "OFFLINE"}
            </span>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="p-2 grid grid-cols-2 gap-2 text-[10px] font-mono border-b border-[var(--theme-border)] bg-[var(--theme-background)]/50">
            <div className="flex flex-col border border-[var(--theme-accent)]/30 p-1.5">
              <span className="text-[var(--theme-text)]/60 font-bold">
                HP_CAPACITY
              </span>
              <span className="text-sm font-bold text-[var(--theme-accent)]">
                {vitals.hp.current} / {vitals.hp.max}
                {vitals.hp.temp > 0 && (
                  <span className="text-[var(--theme-success)] ml-1">
                    (+{vitals.hp.temp})
                  </span>
                )}
              </span>
            </div>
            <div className="flex flex-col border border-[var(--theme-warning)]/30 p-1.5">
              <span className="text-[var(--theme-warning)]/60 font-bold">
                PSY_INSANITY
              </span>
              <span className="text-sm font-bold text-[var(--theme-warning)]">
                {vitals.insanity.current} / {vitals.insanity.max}
              </span>
            </div>
            <div className="flex flex-col border border-[var(--theme-success)]/30 p-1.5">
              <span className="text-[var(--theme-success)]/60 font-bold flex justify-between">
                PWR_ENERGY{" "}
                <span className="text-[8px] opacity-70">
                  [{vitals.energy.state}]
                </span>
              </span>
              <span className="text-sm font-bold text-[var(--theme-success)]">
                {vitals.energy.current} / {vitals.energy.max}
              </span>
            </div>
            <div className="flex flex-col border border-[var(--theme-accent)]/30 p-1.5">
              <span className="text-[var(--theme-text)]/60 font-bold flex justify-between">
                METABOLISM
                <span className="text-[8px] opacity-70">
                  [{vitals.sustenance.state}]
                </span>
              </span>
              <span className="text-sm font-bold text-[var(--theme-accent)]">
                {vitals.sustenance.current} / {vitals.sustenance.max}
              </span>
              <div className="flex justify-between border-b border-[var(--theme-border)]">
                <span>XP:</span>{" "}
                <span className="text-[var(--theme-success)]">
                  {core.xp?.current} / {core.xp?.max}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <Accordion
              title="SISTEMAS ESTATÍSTICOS"
              isOpen={accordions.stats}
              onToggle={() => toggleAccordion("stats")}
            >
              <div className="grid grid-cols-2 gap-4 text-[9px] uppercase p-2 bg-black">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-[var(--theme-accent)] border-b border-[var(--theme-border)] pb-1 mb-1">
                    ATRIBUTOS BASE
                  </span>
                  {Object.entries(core.attributes).map(([key, val]) => (
                    <div
                      key={key}
                      className="flex justify-between border-b border-dashed border-[var(--theme-border)] pb-0.5"
                    >
                      <span className="text-[var(--theme-text)]/70">{key}</span>
                      <span className="text-[var(--theme-warning)] font-bold">
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-[var(--theme-accent)] border-b border-[var(--theme-border)] pb-1 mb-1">
                    PERÍCIAS ATIVAS
                  </span>
                  {Object.entries(core.skills)
                    .filter(([, val]) => val > 0)
                    .map(([key, val]) => (
                      <div
                        key={key}
                        className="flex justify-between border-b border-dashed border-[var(--theme-border)] pb-0.5"
                      >
                        <span className="truncate text-[var(--theme-text)]/70 pr-2">
                          {key}
                        </span>
                        <span className="text-[var(--theme-success)] font-bold">
                          {val}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </Accordion>

            <Accordion
              title="ATRIBUTOS SECUNDÁRIOS"
              isOpen={accordions.sec}
              onToggle={() => toggleAccordion("sec")}
            >
              <div className="grid grid-cols-2 gap-2 p-2 bg-black text-[10px] font-mono">
                {Object.entries(core.secondaryAttributes).map(([key, val]) => (
                  <div
                    key={key}
                    className="flex justify-between border-b border-[var(--theme-border)]"
                  >
                    <span>{key.replace("_", " ")}:</span>{" "}
                    <span className="text-[var(--theme-accent)]">{val}</span>
                  </div>
                ))}
              </div>
            </Accordion>

            {effects !== undefined && (
              <Accordion
                title={`EFEITOS APLICADOS (${effects?.length ?? 0})`}
                isOpen={accordions.effects}
                onToggle={() => toggleAccordion("effects")}
              >
                <div className="flex flex-col gap-1 p-2 bg-[var(--theme-background)]/80 max-h-[180px] overflow-y-auto custom-scrollbar">
                  {effects.map((eff) => {
                    const isRemovable = (customEffectIds ?? []).includes(
                      eff.id,
                    );
                    const valColor =
                      eff.val > 0
                        ? "text-[var(--theme-success)]"
                        : eff.val < 0
                          ? "text-[var(--theme-danger)]"
                          : "text-[var(--theme-accent)]";

                    return (
                      <div
                        key={eff.id}
                        className="flex justify-between items-center border border-[var(--theme-border)] bg-[var(--theme-accent)]/5 p-1.5"
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="text-[10px] uppercase font-mono font-bold text-[var(--theme-accent)] truncate">
                            {eff.description}
                          </span>
                          <span className="text-[8px] uppercase font-mono text-[var(--theme-text)]/60">
                            TARGET: {eff.target} | MODO: {eff.mode}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`font-mono font-bold text-xs ${valColor}`}
                          >
                            {eff.val > 0 ? `+${eff.val}` : eff.val}
                          </span>
                          {isRemovable ? (
                            <Button
                              variant="danger"
                              size="sm"
                              className="h-6 w-6 p-0 flex items-center justify-center border-none text-[8px]"
                              onClick={() => handleRemoveEffectRemote(eff.id)}
                            >
                              X
                            </Button>
                          ) : (
                            <div
                              className="h-6 w-6 flex items-center justify-center opacity-30"
                              title="Efeito atrelado ao sistema/item"
                            >
                              <svg
                                className="w-3 h-3 fill-current"
                                viewBox="0 0 24 24"
                              >
                                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {(effects?.length ?? 0) > 0 && (
                    <span className="text-[9px] text-[var(--theme-text)]/40 italic uppercase text-center block py-2">
                      NENHUM EFEITO DETECTADO.
                    </span>
                  )}
                </div>
              </Accordion>
            )}

            {inventory !== undefined && (
              <Accordion
                title={`INVENTÁRIO COMPLETO (${inventory.length})`}
                isOpen={accordions.inventory}
                onToggle={() => toggleAccordion("inventory")}
              >
                <div className="p-2 bg-[#050505] flex flex-col gap-4">
                  <div className="flex">
                    <Button
                      size="sm"
                      variant={editMode ? "danger" : "primary"}
                      onClick={() => setEditMode((prev) => !prev)}
                    >
                      {editMode ? "Edit Mode - ON" : "Edit Mode - OFF"}
                    </Button>
                  </div>
                  <InventoryZoneV2
                    zoneId={`master_view_${playerName}_carried`}
                    title="EQUIPADO / CARREGADO"
                    items={inventory.filter(
                      (i) => i.isCarried && i.parentId === null,
                    )}
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
                  <InventoryZoneV2
                    zoneId={`master_view_${playerName}_base`}
                    title="NA BASE"
                    items={inventory.filter(
                      (i) => !i.isCarried && i.parentId === null,
                    )}
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
                <ItemModal
                  isOpen={itemModal.isOpen}
                  onClose={itemModal.onClose}
                  itemToEdit={selectedItem}
                  onSaveOverride={(newItem) => {
                    const isLocalNpc = useMasterStore
                      .getState()
                      .npcs.some((n) => n.name === playerName);
                    if (isLocalNpc) {
                      const npc = useMasterStore
                        .getState()
                        .npcs.find((n) => n.name === playerName);
                      if (npc) {
                        const newInv = (npc.inventory || []).map((i) =>
                          i.id === newItem.id ? newItem : i,
                        );
                        useMasterStore
                          .getState()
                          .updateNpcData(npc.id, { inventory: newInv });
                      }
                    } else {
                      const msg = {
                        type: "broadcast" as
                          | "broadcast"
                          | "presence"
                          | "postgres_changes",
                        event: "MASTER_COMMAND",
                        payload: {
                          target: playerName,
                          command: "FORCE_UPDATE_ITEM",
                          data: newItem,
                        },
                      };
                      const channel =
                        useNetworkStore.getState().telemetryChannel;
                      if (channel) {
                        if (typeof channel.httpSend === "function") {
                          channel
                            .httpSend(msg.event, msg.payload)
                            .catch(console.error);
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
                    <div className="bg-[var(--theme-background)] p-3 border border-[var(--theme-danger)]/50 mt-2 text-left">
                      <span className="font-bold text-[var(--theme-danger)] block mb-1">
                        [{selectedItem?.name}]
                      </span>
                      <p className="text-[var(--theme-text)]/60 text-xs font-mono">
                        O item será apagado permanentemente. Caso possua itens
                        internos, eles retornarão à raiz.
                      </p>
                    </div>
                  }
                  onConfirm={() => {
                    if (selectedItem) {
                      const isLocalNpc = useMasterStore
                        .getState()
                        .npcs.some((n) => n.name === playerName);
                      if (isLocalNpc) {
                        const npc = useMasterStore
                          .getState()
                          .npcs.find((n) => n.name === playerName);
                        if (npc) {
                          const newInv = (npc.inventory || []).filter(
                            (i) => i.id !== selectedItem.id,
                          );
                          useMasterStore
                            .getState()
                            .updateNpcData(npc.id, { inventory: newInv });
                        }
                      } else {
                        const msg = {
                          type: "broadcast" as
                            | "broadcast"
                            | "presence"
                            | "postgres_changes",
                          event: "MASTER_COMMAND",
                          payload: {
                            target: playerName,
                            command: "FORCE_DELETE_ITEM",
                            data: { id: selectedItem.id },
                          },
                        };
                        const channel =
                          useNetworkStore.getState().telemetryChannel;
                        if (channel) {
                          if (typeof channel.httpSend === "function") {
                            channel
                              .httpSend(msg.event, msg.payload)
                              .catch(console.error);
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

            <Accordion
              title={`ANOMALIAS E DESVANTAGENS (${core.disadvantages.length})`}
              isOpen={accordions.flaws}
              onToggle={() => toggleAccordion("flaws")}
            >
              <div className="flex flex-col gap-2 p-2 bg-[var(--theme-danger)]/5 max-h-[180px] overflow-y-auto custom-scrollbar">
                {core.disadvantages.map((flaw) => (
                  <div
                    key={flaw.id}
                    className="flex flex-col border-l-2 border-[var(--theme-danger)] pl-2"
                  >
                    <span className="text-[10px] font-bold text-[var(--theme-danger)] uppercase">
                      {flaw.title}
                    </span>
                    <span className="text-[9px] text-[var(--theme-text)]/70 italic uppercase leading-tight">
                      {flaw.description}
                    </span>
                  </div>
                ))}
                {core.disadvantages.length === 0 && (
                  <span className="text-[9px] text-[var(--theme-text)]/40 italic uppercase text-center block py-2">
                    NENHUMA ANOMALIA DETECTADA.
                  </span>
                )}
              </div>
            </Accordion>
          </div>
        </div>
      </div>
    );
  },
);
