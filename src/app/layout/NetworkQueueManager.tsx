import { useEffect, useRef, useState } from "react";
import { useNetworkStore } from "../../shared/store/useNetworkStore";
import { useEventsStore } from "../../features/events/store/useEventsStore";
import type { GameEvent } from "../../shared/types/events";
import { useVitalsStore } from "../../features/vitals/useVitalsStore";
import {
  useCharacterStore,
  type CharacterStore,
} from "../../features/character/store";
import { useRoller } from "../../shared/hooks/useRoller";
import { RetroToast } from "../../shared/ui/RetroToast";
import type {
  Item,
  CustomEffect,
  InstantAction,
  Note,
} from "../../shared/types/veil-grey";
import { Modal } from "../../shared/ui/Overlays";
import { Button } from "../../shared/ui/Form";
import { ItemNodeV2 } from "../../features/inventory/components/ItemNodeV2";
import { WalletSelectorDnd } from "../../shared/ui/WalletSelectorDnd";

export function NetworkQueueManager() {
  const queue = useNetworkStore((state) => state.queue);
  const removeQueueItem = useNetworkStore((state) => state.removeQueueItem);
  const activeName = useCharacterStore((s) => s.isPossessing || s.name);
  const baseName = useCharacterStore((s) => s.name);

  const activeQueue = queue.filter(
    (q) =>
      q.targetName === activeName ||
      q.targetName === baseName ||
      q.targetName === "ALL",
  );

  const importExternalNote = useCharacterStore(
    (state) => state.importExternalNote,
  );

  const vitals = useVitalsStore();
  const {
    addInventoryItem,
    addXp,
    addCustomEffect,
    removeCustomEffect,
    processDirectAction,
    attributes,
    skills,
    inventory,
    updateInventoryItem,
  } = useCharacterStore();

  const { initiateRoll } = useRoller();

  const processingIdRef = useRef<string | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");

  useEffect(() => {
    if (activeQueue.length === 0) {
      if (processingIdRef.current) processingIdRef.current = null;
      return;
    }

    const current = activeQueue[0];
    const anyVitalsModalOpen =
      vitals.isOpen ||
      vitals.isDefenseOpen ||
      vitals.isInsanityOpen ||
      vitals.isSustenanceOpen;

    if (current.type === "REMOVE_EFFECT") {
      const data = current.data as { id: number };
      removeCustomEffect(data.id);
      RetroToast.warning("O MESTRE REMOVEU UM EFEITO.");
      removeQueueItem(current.id);
      if (processingIdRef.current === current.id)
        processingIdRef.current = null;
      return;
    }

    if (current.type === "REST_RESPONSE") {
      const config = current.data as { difficulty: number; temperature: number; comfort: number };
      vitals.setFullRestMasterConfig(config);
      RetroToast.success("O MESTRE AVALIOU SEU AMBIENTE DE DESCANSO.");
      removeQueueItem(current.id);
      if (processingIdRef.current === current.id)
        processingIdRef.current = null;
      return;
    }

    if (current.type === "EVENT_SYNC") {
      const data = current.data as { action: "UPSERT" | "DELETE"; event?: GameEvent; eventId?: string };
      const { addEvent, updateEvent, removeEvent, activeEvents } = useEventsStore.getState();
      
      if (data.action === "DELETE" && data.eventId) {
        removeEvent(data.eventId);
        RetroToast.warning("EVENTO CANCELADO PELO MESTRE.");
      } else if (data.action === "UPSERT" && data.event) {
        // Ignora se for o mestre recebendo o proprio echo (já tem salvo no useMasterEventsStore)
        const isTargeted = data.event.targets.includes(activeName) || data.event.targets.length === 0 || data.event.targets.includes("ALL") || activeName === "MASTER";
        const existing = activeEvents.find(e => e.id === data.event!.id);

        if (!isTargeted || data.event.status !== "ACTIVE") {
           if (existing) {
             removeEvent(data.event.id);
           }
        } else {
           if (existing) {
             updateEvent(existing.id, data.event);
           } else {
             addEvent(data.event);
             RetroToast.success(`NOVO EVENTO: [${data.event.title}]`);
           }
        }
      }
      
      removeQueueItem(current.id);
      if (processingIdRef.current === current.id)
        processingIdRef.current = null;
      return;
    }

    if (current.type === "P2P_FINAL_SETTLEMENT") {
      const data = current.data as { walletId: string; delta: number; finalBalance?: number; currency: string };
      const targetWallet = useCharacterStore.getState().inventory.find(i => i.id === data.walletId);
      if (targetWallet && targetWallet.wallet) {
         useCharacterStore.getState().updateInventoryItem(data.walletId, "wallet", {
            ...targetWallet.wallet,
            value: targetWallet.wallet.value + data.delta
         });
         window.dispatchEvent(new CustomEvent("OPEN_EVENT_RESULT", { detail: {
            title: "COMPROVANTE DE TRANSFERÊNCIA P2P",
            hostName: current.attackerName || "MAINFRAME",
            walletId: data.walletId,
            walletName: targetWallet.name,
            delta: data.delta,
            finalBalance: data.finalBalance,
            currency: data.currency
         }}));
      } else if (data.walletId === "NEW_WALLET") {
         const newWallet: Item = {
           id: crypto.randomUUID(),
           name: `Fundo Coletivo Recebido`,
           type: "EQUIPABLE",
           quantity: 1,
           slots: 0,
           isCarried: true,
           isEquipped: false,
           parentId: null,
           drawer: null,
           effects: [],
           description: "",
           svgId: "wallet",
           price: 0,
           wallet: {
             type: data.currency as "CC" | "FCC",
             value: data.delta,
             max: null,
           },
         };
         useCharacterStore.getState().addInventoryItem(newWallet);
         
         window.dispatchEvent(new CustomEvent("OPEN_EVENT_RESULT", { detail: {
            title: "RESGATE DE POOL FINAL",
            hostName: "SISTEMA",
            walletId: newWallet.id,
            walletName: newWallet.name,
            delta: data.delta,
            finalBalance: data.finalBalance,
            currency: data.currency
         }}));
      }
      removeQueueItem(current.id);
      if (processingIdRef.current === current.id) processingIdRef.current = null;
      return;
    }

    if (processingIdRef.current === current.id) {
      if (["COMBAT_DEFENSE", "ACTION"].includes(current.type)) {
        const act = current.data as {
          target: string;
          val: number;
          description: string;
        };
        const isDirectAction =
          current.type === "ACTION" &&
          ![
            "HP_DRAIN",
            "HP_HEAL",
            "INSANITY_ADD",
            "INSANITY_DRAIN",
            "SUSTENANCE_ADD",
            "SUSTENANCE_DRAIN",
          ].includes(act.target);

        if (!isDirectAction && !anyVitalsModalOpen) {
          removeQueueItem(current.id);
          processingIdRef.current = null;
        }
      }
      return;
    }

    if (!anyVitalsModalOpen) {
      processingIdRef.current = current.id;

      if (current.type === "COMBAT_DEFENSE") {
        vitals.openDefenseModal(
          current.data as {
            attackRoll: number;
            damage: number;
            attackerName: string;
          },
        );
      } else if (current.type === "ACTION") {
        const act = current.data as {
          target: string;
          val: number;
          description: string;
        };
        if (act.target === "HP_DRAIN") {
          vitals.openModal("DAMAGE", act.val.toString(), true);
        } else if (act.target === "HP_HEAL") {
          vitals.openModal("HEALING", act.val.toString(), true);
        } else if (act.target === "INSANITY_ADD") {
          vitals.openInsanityModal("ADD", act.val.toString(), true);
        } else if (act.target === "INSANITY_DRAIN") {
          vitals.openInsanityModal("SUB", act.val.toString(), true);
        } else if (act.target === "SUSTENANCE_ADD") {
          vitals.openSustenanceModal("ADD", act.val.toString(), true);
        } else if (act.target === "SUSTENANCE_DRAIN") {
          vitals.openSustenanceModal("SUB", act.val.toString(), true);
        }
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQueue, vitals]);

  if (activeQueue.length === 0) return null;
  const current = activeQueue[0];

  if (["COMBAT_DEFENSE", "REMOVE_EFFECT", "REST_RESPONSE", "EVENT_SYNC"].includes(current.type)) return null;

  if (current.type === "ACTION") {
    const act = current.data as {
      target: string;
      val: number;
      description: string;
    };
    const isDirectAction = ![
      "HP_DRAIN",
      "HP_HEAL",
      "INSANITY_ADD",
      "INSANITY_DRAIN",
      "SUSTENANCE_ADD",
      "SUSTENANCE_DRAIN",
    ].includes(act.target);
    if (!isDirectAction) return null;
  }

  const handleAccept = () => {
    if (current.type === "ITEM") {
      const itemData = current.data as Item;

      if (itemData.isSoulBound) {
        const boundItem: Item = {
          ...itemData,
          id: crypto.randomUUID(),
          parentId: null,
          isCarried: true,
          isEquipped: true,
        };
        addInventoryItem(boundItem);
        RetroToast.warning("ITEM VINCULADO À ALMA EQUIPADO AUTOMATICAMENTE.");
      } else {
        const newItem: Item = {
          ...itemData,
          id: crypto.randomUUID(),
          parentId: null,
          isCarried: true,
          isEquipped: false,
        };
        addInventoryItem(newItem);
        RetroToast.success(`MATÉRIA RECEBIDA: [${newItem.name}]`);
      }
    } else if (current.type === "XP") {
      const xpData = current.data as { amount: number };
      addXp(xpData.amount);
      RetroToast.success(`EXPERIÊNCIA RECEBIDA: +${xpData.amount} XP`);
    } else if (current.type === "EFFECT") {
      const newEffect: CustomEffect = {
        ...(current.data as CustomEffect),
        id: Date.now() + Math.random(),
        link: null,
      };
      addCustomEffect(newEffect);
      RetroToast.success(`EFEITO APLICADO: [${newEffect.description}]`);
    } else if (current.type === "ROLL_REQUEST") {
      const req = current.data as {
        title: string;
        rollKey: string;
        rollCategory: string;
        dc?: number;
      };
      let baseVal = 0;
      if (req.rollKey in attributes)
        baseVal = attributes[req.rollKey as keyof typeof attributes];
      if (req.rollKey in skills)
        baseVal = skills[req.rollKey as keyof typeof skills];
      initiateRoll(
        req.title,
        `1d20+${baseVal}`,
        [req.rollKey, req.rollCategory],
        req.dc,
      );
    } else if (current.type === "ACTION") {
      const actionData = current.data as InstantAction;
      processDirectAction(actionData);
      RetroToast.success(`AÇÃO IMEDIATA: [${actionData.description}]`);
    } else if (current.type === "NOTE") {
      const payloadData = current.data as {
        note: Note;
        effects: CustomEffect[];
      };
      importExternalNote(payloadData.note, payloadData.effects);
      RetroToast.success(`NOTA INCORPORADA: [${payloadData.note.title}]`);
    } else if (current.type === "FULL_OVERRIDE") {
      useCharacterStore
        .getState()
        .importCharacterData(current.data as Partial<CharacterStore>);
      RetroToast.success("FICHA SINCRONIZADA COM O MAINFRAME.");
      useNetworkStore.getState().sendPayload("MESTRE", "OVERRIDE_ACCEPTED", {
        playerName: activeName,
      });
    } else if (current.type === "REST_RESPONSE") {
      const config = current.data as { difficulty: number; temperature: number; comfort: number };
      vitals.setFullRestMasterConfig(config);
      RetroToast.success("O MESTRE AVALIOU SEU AMBIENTE DE DESCANSO.");
    } else if (current.type === "FUNDS") {
      const fundsData = current.data as { amount: number; currency: string };
      if (!selectedWalletId) {
        RetroToast.error("SELECIONE UMA CARTEIRA PARA RECEBER OS FUNDOS.");
        return;
      }
      const targetWallet = inventory.find((i) => i.id === selectedWalletId);
      if (!targetWallet || !targetWallet.wallet) {
        RetroToast.error("CARTEIRA INVÁLIDA.");
        return;
      }
      
      const isUnlimited = targetWallet.wallet.max === null;
      const spaceLeft = isUnlimited ? Infinity : targetWallet.wallet.max! - targetWallet.wallet.value;
      if (spaceLeft < fundsData.amount) {
        RetroToast.error("CAPACIDADE INSUFICIENTE NESTA CARTEIRA.");
        return;
      }

      updateInventoryItem(selectedWalletId, "wallet", {
        ...targetWallet.wallet,
        value: targetWallet.wallet.value + fundsData.amount,
      });
      RetroToast.success(`FUNDOS RECEBIDOS: +${fundsData.amount} ${fundsData.currency}`);
    } else if (current.type === "DEBT") {
      const debtData = current.data as { amount: number; currency: string };
      if (!selectedWalletId) {
        RetroToast.error("SELECIONE UMA CARTEIRA PARA PAGAR A DÍVIDA.");
        return;
      }
      const targetWallet = inventory.find((i) => i.id === selectedWalletId);
      if (!targetWallet || !targetWallet.wallet) {
        RetroToast.error("CARTEIRA INVÁLIDA.");
        return;
      }

      updateInventoryItem(selectedWalletId, "wallet", {
        ...targetWallet.wallet,
        value: targetWallet.wallet.value - debtData.amount,
      });
      RetroToast.warning(`DÍVIDA PAGA: -${debtData.amount} ${debtData.currency}`);
    }

    setSelectedWalletId("");
    removeQueueItem(current.id);
    processingIdRef.current = null;
  };

  const handleReject = () => {
    setSelectedWalletId("");
    removeQueueItem(current.id);
    processingIdRef.current = null;
  };

  return (
    <Modal
      isOpen={true}
      onClose={() => {}}
      title={`TRANSMISSÃO RECEBIDA [${activeQueue.length} RESTANTES]`}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col gap-4 text-center">
        <div className="bg-[var(--theme-warning)]/10 border border-[var(--theme-warning)] p-4">
          <span className="text-[10px] tracking-widest text-[var(--theme-warning)] font-bold block uppercase mb-2">
            ORIGEM DA TRANSMISSÃO: {current.attackerName}
          </span>

          {current.type === "ITEM" && (
            <div className="flex flex-col items-center gap-2 pointer-events-none mt-4 border border-[var(--theme-accent)]">
              <ItemNodeV2
                item={current.data as Item}
                allInventory={[]}
                onEdit={() => {}}
                onDelete={() => {}}
                onToggleEquip={() => {}}
                isEditMode={false}
                isPreview={true}
              />
            </div>
          )}

          {current.type === "XP" && (
            <div className="text-4xl font-mono text-[var(--theme-success)] font-black glow-success my-4">
              +{(current.data as { amount: number }).amount} XP
            </div>
          )}

          {current.type === "EFFECT" && (
            <div className="text-lg font-mono text-[var(--theme-accent)] font-bold my-4 border border-[var(--theme-accent)] p-2">
              EFEITO: {(current.data as CustomEffect).description}
              <br />
              <span className="text-sm">
                (
                {(current.data as CustomEffect).val > 0
                  ? `+${(current.data as CustomEffect).val}`
                  : (current.data as CustomEffect).val}{" "}
                | {(current.data as CustomEffect).mode})
              </span>
            </div>
          )}

          {current.type === "ACTION" && (
            <div className="text-lg font-mono text-[var(--theme-success)] font-bold my-4 border border-[var(--theme-success)] p-2">
              AÇÃO IMEDIATA:{" "}
              {(current.data as { description: string }).description}
            </div>
          )}

          {current.type === "ROLL_REQUEST" && (
            <div className="flex flex-col gap-2 my-4">
              <span className="text-xl font-mono text-[var(--theme-accent)] font-bold glow-text uppercase">
                {(current.data as { title: string }).title}
              </span>
              {(current.data as { dc?: number }).dc !== undefined && (
                <span className="text-xs font-mono text-[var(--theme-warning)] mt-2 block font-bold">
                  DIFICULDADE ALVO: DC {(current.data as { dc: number }).dc}
                </span>
              )}
            </div>
          )}

          {current.type === "NOTE" && (
            <div className="flex flex-col gap-2 my-4 border border-[var(--theme-accent)] p-3 bg-[var(--theme-background)] text-left">
              <span className="text-[10px] text-[var(--theme-accent)] font-bold tracking-widest border-b border-[var(--theme-accent)]/30 pb-1 uppercase">
                DOCUMENTO ANEXADO
              </span>
              <span className="text-sm font-bold uppercase text-[var(--theme-accent)]">
                {(current.data as { note: Note }).note.title}
              </span>
              <span className="text-xs font-mono text-[var(--theme-text)]/70 line-clamp-3 italic">
                {(current.data as { note: Note }).note.content}
              </span>
              {(current.data as { effects: CustomEffect[] }).effects.length >
                0 && (
                <span className="text-[10px] text-[var(--theme-warning)] font-bold mt-2 uppercase tracking-widest">
                  +{" "}
                  {(current.data as { effects: CustomEffect[] }).effects.length}{" "}
                  EFEITO(S) INCLUSO(S)
                </span>
              )}
            </div>
          )}

          {current.type === "FULL_OVERRIDE" && (
            <div className="flex flex-col gap-2 my-4 border border-[var(--theme-warning)] p-3 bg-[var(--theme-warning)]/10 text-left">
              <span className="text-[10px] text-[var(--theme-warning)] font-bold tracking-widest border-b border-[var(--theme-warning)]/30 pb-1 uppercase">
                OVERRIDE DE SISTEMA
              </span>
              <span className="text-sm font-bold uppercase text-[var(--theme-warning)]">
                Atualizações estruturais enviadas pelo Mestre.
              </span>
              <span className="text-xs font-mono text-[var(--theme-text)]/70 italic">
                Aceitar este pacote aplicará imediatamente as edições feitas na
                sua ficha remotamente.
              </span>
            </div>

          )}

          {current.type === "FUNDS" && (
            <div className="flex flex-col gap-2 my-4 border border-emerald-500 p-3 bg-emerald-900/10 text-left">
              <span className="text-[10px] text-emerald-400 font-bold tracking-widest border-b border-emerald-500/30 pb-1 uppercase">
                TRANSFERÊNCIA DE FUNDOS
              </span>
              <span className="text-xl font-bold uppercase text-emerald-400 font-mono text-center my-2">
                +{(current.data as { amount: number }).amount}{" "}
                {(current.data as { currency: string }).currency}
              </span>
              <span className="text-xs font-mono text-emerald-400/70 text-center mb-2">
                Selecione a carteira de destino arrastando-a para a zona acima:
              </span>
              <WalletSelectorDnd
                inventory={inventory}
                currency={(current.data as { currency: string }).currency}
                selectedWalletId={selectedWalletId}
                onSelect={(id) => setSelectedWalletId(id)}
                onUnselect={() => setSelectedWalletId("")}
              />
            </div>
          )}
          {current.type === "DEBT" && (
            <div className="flex flex-col gap-2 my-4 border border-red-500 p-3 bg-red-900/10 text-left">
              <span className="text-[10px] text-red-400 font-bold tracking-widest border-b border-red-500/30 pb-1 uppercase">
                COBRANÇA DE DÍVIDA
              </span>
              <span className="text-xl font-bold uppercase text-red-400 font-mono text-center my-2">
                -{(current.data as { amount: number }).amount}{" "}
                {(current.data as { currency: string }).currency}
              </span>
              <span className="text-xs font-mono text-red-400/70 text-center mb-2">
                Selecione a carteira para efetuar o pagamento arrastando-a para a zona acima:
              </span>
              <WalletSelectorDnd
                inventory={inventory}
                currency={(current.data as { currency: string }).currency}
                selectedWalletId={selectedWalletId}
                onSelect={(id) => setSelectedWalletId(id)}
                onUnselect={() => setSelectedWalletId("")}
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-2">
          {current.type !== "FULL_OVERRIDE" && current.type !== "DEBT" && (
            <Button
              variant="danger"
              onClick={handleReject}
              className="flex-1 border-dashed"
            >
              DESCARTAR
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleAccept}
            className="flex-[2] animate-pulse"
          >
            ACEITAR PACOTE
          </Button>
        </div>
      </div>
    </Modal>
  );
}
