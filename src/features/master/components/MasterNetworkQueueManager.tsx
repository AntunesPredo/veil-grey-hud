import { useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { useNetworkStore } from "../../../shared/store/useNetworkStore";
import { useMasterEventsStore } from "../../events/store/useMasterEventsStore";
import { dispatchDiscordLog } from "../../../shared/utils/discordWebhook";
import { useVitalsStore } from "../../vitals/useVitalsStore";
import {
  useCharacterStore,
  extractCharacterData,
  type CharacterStore,
} from "../../character/store";
import { useRoller } from "../../../shared/hooks/useRoller";
import { RetroToast } from "../../../shared/ui/RetroToast";
import type {
  Item,
  CustomEffect,
  InstantAction,
  Note,
} from "../../../shared/types/veil-grey";
import { Modal } from "../../../shared/ui/Overlays";
import { Button, Slider } from "../../../shared/ui/Form";
import { ItemNodeV2 } from "../../inventory/components/ItemNodeV2";
import { useMasterStore, type MasterItem } from "../masterStore";
import { VG_CONFIG } from "../../../shared/config/system.config";

export function MasterNetworkQueueManager() {
  const queue = useNetworkStore((state) => state.queue);
  const removeQueueItem = useNetworkStore((state) => state.removeQueueItem);

  const npcs = useMasterStore((state) => state.npcs);
  const activeNpcs = npcs.filter((n) => n.isActive);
  const activeNpcNames = activeNpcs.map((n) => n.name);

  const activeQueue = queue.filter(
    (q) => q.targetName === "MESTRE" || q.targetName === "ALL" || activeNpcNames.includes(q.targetName)
  );

  const vitals = useVitalsStore();
  const { removeCustomEffect } = useCharacterStore();

  const { initiateRoll } = useRoller();

  const processingIdRef = useRef<string | null>(null);

  const [restTemp, setRestTemp] = useState(0);
  const [restComfort, setRestComfort] = useState(0);
  const [restDiff, setRestDiff] = useState(15);

  useEffect(() => {
    if (activeQueue.length > 0 && activeQueue[0].type === "REST_REQUEST") {
      const settings = useMasterStore.getState().lastRestSettings;
      if (settings) {
        setRestTemp(settings.temperature);
        setRestComfort(settings.comfort);
        setRestDiff(settings.difficulty);
      } else {
        setRestTemp(0);
        setRestComfort(0);
        setRestDiff(15);
      }
    }
  }, [activeQueue[0]?.id, activeQueue[0]?.type]);

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
      vitals.isInsanityOpen ||
      vitals.isSustenanceOpen;

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
          if (activeNpcNames.includes(current.targetName)) {
            const charStore = useCharacterStore.getState();
            const npc = npcs.find((n) => n.name === current.targetName);
            if (npc) {
              useMasterStore.getState().updateNpcData(npc.id, charStore);
            }
          }
          removeQueueItem(current.id);
          processingIdRef.current = null;
        }
      }
      return;
    }

    if (current.type === "EVENT_SYNC") {
      const data = current.data as { action: "UPSERT" | "REMOVE"; event?: any; eventId?: string };
      const mEventsStore = useMasterEventsStore.getState();
      if (data.action === "UPSERT" && data.event) {
        if (mEventsStore.masterEvents.some((e) => e.id === data.event!.id)) {
          mEventsStore.updateEvent(data.event!.id, data.event);
        } else {
          mEventsStore.addEvent(data.event);
        }
      } else if (data.action === "REMOVE" && data.eventId) {
        mEventsStore.removeEvent(data.eventId);
      }
      removeQueueItem(current.id);
      if (processingIdRef.current === current.id) processingIdRef.current = null;
      return;
    }

    if (current.type === "SAVE_DELIVERY") {
      processingIdRef.current = current.id;
      const dataUri =
        "data:text/plain;charset=utf-8," +
        encodeURIComponent(current.data as string);
      const link = document.createElement("a");
      link.href = dataUri;
      link.download = `VG_DELIVERY_SAVE_${current.attackerName}.json`;
      link.click();
      RetroToast.success(
        `FICHA DE [${current.attackerName}] RECEBIDA E BAIXADA.`,
      );
      removeQueueItem(current.id);
      return;
    }

    if (current.type === "OVERRIDE_ACCEPTED") {
      processingIdRef.current = current.id;
      const data = current.data as { playerName: string };
      useMasterStore.getState().removePendingOverride(data.playerName);
      RetroToast.success(`ALTERAÇÕES ASSIMILADAS POR: ${data.playerName}`);
      removeQueueItem(current.id);
      return;
    }

    if (current.type === "EVENT_ACTION") {
      processingIdRef.current = current.id;
      const data = current.data as any;
      const mEventsStore = useMasterEventsStore.getState();
      const targetEvent = mEventsStore.masterEvents.find(e => e.id === data.eventId);

      if (targetEvent) {
        if (data.action === "NEXT_TURN" && targetEvent.type === "COMBAT") {
          const participantsList = Object.values(targetEvent.payload.participants).sort((a: any, b: any) => b.initiative - a.initiative);

          if (participantsList.length > 0 && !participantsList.every((p: any) => p.isBlocked)) {
            const currentIndex = participantsList.findIndex((p: any) => p.name === targetEvent.payload.currentTurn);
            let nextIndex = currentIndex + 1;
            let nextRound = targetEvent.payload.currentRound || 1;

            if (nextIndex >= participantsList.length) {
              nextIndex = 0;
              nextRound += 1;
            }

            while ((participantsList[nextIndex] as any).isBlocked) {
              nextIndex += 1;
              if (nextIndex >= participantsList.length) {
                nextIndex = 0;
                nextRound += 1;
              }
            }

            const nextTurnParticipant = (participantsList[nextIndex] as any).name;

            const newEvent = structuredClone(targetEvent) as any;
            newEvent.payload.currentRound = nextRound;
            newEvent.payload.currentTurn = nextTurnParticipant;

            if (newEvent.payload.participants[nextTurnParticipant]) {
              newEvent.payload.participants[nextTurnParticipant].apUsed = 0;
              newEvent.payload.participants[nextTurnParticipant].reactionUsed = 0;
            }

            mEventsStore.updateEvent(targetEvent.id, newEvent);
            useNetworkStore.getState().sendPayload("ALL", "EVENT_SYNC", { action: "UPSERT", event: newEvent });
          }
        }

        if (data.action === "PAY_DEBT" && targetEvent.type === "DEBT") {
          const charId = data.characterId;
          const amt = data.amount;
          const currentOwed = targetEvent.payload.debts[charId] || 0;

          const newOwed = Math.max(0, currentOwed - amt);
          const newRemaining = Math.max(0, targetEvent.payload.remainingAmount - amt);

          const newEvent = {
            ...targetEvent,
            payload: {
              ...targetEvent.payload,
              debts: {
                ...targetEvent.payload.debts,
                [charId]: newOwed
              },
              remainingAmount: newRemaining
            }
          };

          const msg = `Pagou ${amt} ${targetEvent.payload.currency} usando ${data.walletName}.`;
          mEventsStore.addLog({
            eventId: newEvent.id,
            characterId: charId,
            message: msg
          });
          dispatchDiscordLog("PLAYER", "Painel de Eventos", msg, [{
            title: newEvent.title,
            description: msg,
            color: 15158332,
            author: { name: charId }
          }]);

          RetroToast.success(`[EVENTO] ${charId} pagou ${amt} na dívida!`);

          // Re-broadcast updated event
          useNetworkStore.getState().sendPayload("ALL", "EVENT_SYNC", { action: "UPSERT", event: newEvent });
        }

        if (targetEvent.type === "P2P_TRANSFER") {
          let newEvent = { ...targetEvent };
          let skipSync = false;

          const resetP2PConfirmations = (payload: any) => {
            const parts = { ...payload.participants };
            Object.keys(parts).forEach(k => { parts[k] = { ...parts[k], transferConfirmed: false }; });
            return { ...payload, hostConfirmed: false, participants: parts };
          };

          if (data.action === "P2P_HOST_ENTER") {
            newEvent.payload = { ...newEvent.payload, hostIsPresent: true };
          }
          if (data.action === "P2P_HOST_LEAVE") {
            newEvent.payload = { ...newEvent.payload, hostIsPresent: false };
          }
          if (data.action === "P2P_CONFIRM_WALLET") {
            const charId = data.characterId;
            const walletId = data.walletId;
            const balance = data.balance;

            newEvent.payload = {
              ...newEvent.payload,
              participants: {
                ...newEvent.payload.participants,
                [charId]: {
                  walletId,
                  initialBalance: balance,
                  currentBalance: balance,
                  approved: true,
                  transferConfirmed: false
                }
              }
            };
          }
          if (data.action === "P2P_CANCEL_WALLET") {
            const charId = data.characterId;
            const newParticipants = { ...newEvent.payload.participants };
            if (newParticipants[charId]) {
              delete newParticipants[charId];
              newEvent.payload = resetP2PConfirmations({
                ...newEvent.payload,
                participants: newParticipants
              });
            }
          }
          if (data.action === "P2P_TOGGLE_CONFIRM") {
            const charId = data.characterId;
            if (charId === newEvent.payload.hostId) {
              newEvent.payload = { ...newEvent.payload, hostConfirmed: !newEvent.payload.hostConfirmed };
            } else if (newEvent.payload.participants[charId]) {
              newEvent.payload = {
                ...newEvent.payload,
                participants: {
                  ...newEvent.payload.participants,
                  [charId]: {
                    ...newEvent.payload.participants[charId],
                    transferConfirmed: !newEvent.payload.participants[charId].transferConfirmed
                  }
                }
              };
            }
          }
          if (data.action === "P2P_DIVIDE_POOL") {
            const participantIds = Object.keys(newEvent.payload.participants);
            if (participantIds.length > 0) {
              const splitAmount = Math.floor(newEvent.payload.pool / participantIds.length);
              const remainder = newEvent.payload.pool % participantIds.length;
              const newParticipants = { ...newEvent.payload.participants };
              const newTransactions = [...(newEvent.payload.transactions || [])];

              participantIds.forEach((pid) => {
                newParticipants[pid].currentBalance += splitAmount;
                newTransactions.push({ id: nanoid(), from: "POOL", to: pid, amount: splitAmount, timestamp: Date.now() });
              });

              newEvent.payload = resetP2PConfirmations({
                ...newEvent.payload,
                pool: remainder,
                participants: newParticipants,
                transactions: newTransactions
              });
            }
          }
          if (data.action === "P2P_TRANSFER_TO_POOL") {
            const newParticipants = { ...newEvent.payload.participants };
            const newTransactions = [...(newEvent.payload.transactions || [])];
            let addedToPool = 0;
            Object.keys(newParticipants).forEach(pid => {
              const p = newParticipants[pid];
              const minBalance = Math.min(0, p.initialBalance);
              const maxPull = p.currentBalance - minBalance;
              if (maxPull > 0) {
                addedToPool += maxPull;
                p.currentBalance -= maxPull;
                newTransactions.push({ id: nanoid(), from: pid, to: "POOL", amount: maxPull, timestamp: Date.now() });
              }
            });
            newEvent.payload = resetP2PConfirmations({
              ...newEvent.payload,
              pool: newEvent.payload.pool + addedToPool,
              participants: newParticipants,
              transactions: newTransactions
            });
          }
          if (data.action === "P2P_PULL_FROM_PLAYER") {
            const pid = data.participantId;
            const newParticipants = { ...newEvent.payload.participants };
            const newTransactions = [...(newEvent.payload.transactions || [])];
            if (newParticipants[pid]) {
              const p = newParticipants[pid];
              const minBalance = Math.min(0, p.initialBalance);
              const maxPull = p.currentBalance - minBalance;

              if (maxPull > 0) {
                const pullAmount = data.amount !== undefined ? Math.min(data.amount, maxPull) : maxPull;
                if (pullAmount > 0) {
                  p.currentBalance -= pullAmount;
                  newTransactions.push({ id: nanoid(), from: pid, to: "POOL", amount: pullAmount, timestamp: Date.now() });

                  newEvent.payload = resetP2PConfirmations({
                    ...newEvent.payload,
                    pool: newEvent.payload.pool + pullAmount,
                    participants: newParticipants,
                    transactions: newTransactions
                  });
                }
              }
            }
          }
          if (data.action === "P2P_TRANSFER_TO_PLAYER") {
            const pid = data.participantId;
            const amount = data.amount;
            const newParticipants = { ...newEvent.payload.participants };
            const newTransactions = [...(newEvent.payload.transactions || [])];

            if (newEvent.payload.pool >= amount && newParticipants[pid]) {
              newParticipants[pid].currentBalance += amount;
              newTransactions.push({ id: nanoid(), from: "POOL", to: pid, amount: amount, timestamp: Date.now() });

              newEvent.payload = resetP2PConfirmations({
                ...newEvent.payload,
                pool: newEvent.payload.pool - amount,
                participants: newParticipants,
                transactions: newTransactions
              });
            }
          }
          if (data.action === "CLOSE_P2P") {
            const charId = data.characterId;
            const finalParticipants = newEvent.payload.participants;

            Object.keys(finalParticipants).forEach(pid => {
              const pData = finalParticipants[pid];
              const delta = pData.currentBalance - pData.initialBalance;

              useNetworkStore.getState().sendPayload(pid, "P2P_FINAL_SETTLEMENT", {
                walletId: pData.walletId,
                delta: delta,
                finalBalance: pData.currentBalance,
                currency: newEvent.payload.currency
              });
            });

            const activeName = useCharacterStore.getState().name;
            if (newEvent.payload.pool > 0 && activeName === "MASTER") {
              RetroToast.success(`P2P FINALIZADO. Fundo de ${newEvent.payload.pool} ${newEvent.payload.currency} dissipado pelo sistema.`);
            } else if (newEvent.payload.pool > 0 && activeName !== "MASTER") {
              useNetworkStore.getState().sendPayload(charId, "P2P_FINAL_SETTLEMENT", {
                walletId: "NEW_WALLET",
                delta: newEvent.payload.pool,
                finalBalance: newEvent.payload.pool,
                currency: newEvent.payload.currency
              });
              RetroToast.success(`P2P FINALIZADO. O host resgatou o resto da pool.`);
            }

            newEvent.status = "PENDING";
            newEvent.payload = resetP2PConfirmations({
              ...newEvent.payload,
              initialPool: newEvent.payload.pool
            });
          }

          if (!skipSync) {
            mEventsStore.updateEvent(newEvent.id, newEvent);
            useNetworkStore.getState().sendPayload("ALL", "EVENT_SYNC", { action: "UPSERT", event: newEvent });
          }
        }

        if (data.action === "ACCEPT_JOB" && targetEvent.type === "JOB") {
          const charId = data.characterId;

          const newEvent = {
            ...targetEvent,
            payload: {
              ...targetEvent.payload,
              limboTransactions: {
                ...(targetEvent.payload.limboTransactions || {}),
                [charId]: true
              }
            }
          };

          mEventsStore.updateEvent(newEvent.id, newEvent);
          const msg = `Aceitou o trabalho. Aguardando pagamento.`;
          mEventsStore.addLog({
            eventId: newEvent.id,
            characterId: charId,
            message: msg
          });
          dispatchDiscordLog("PLAYER", "Painel de Eventos", msg, [{
            title: newEvent.title,
            description: msg,
            color: 1752220,
            author: { name: charId }
          }]);

          RetroToast.success(`[EMPREGO] ${charId} aceitou o trabalho!`);

          // Re-broadcast updated event
          useNetworkStore.getState().sendPayload("ALL", "EVENT_SYNC", { action: "UPSERT", event: newEvent });
        }

        if (data.action === "PAY_WORKERS" && targetEvent.type === "JOB") {
          const workers = Object.keys(targetEvent.payload.limboTransactions || {});

          if (workers.length > 0) {

            workers.forEach(workerId => {
              const salaryItem = {
                id: nanoid(),
                name: `Salário: ${targetEvent.payload.employerName}`,
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
                  type: targetEvent.payload.currency as "CC" | "FCC",
                  value: targetEvent.payload.salary,
                  max: null,
                },
              };

              useNetworkStore.getState().sendPayload(workerId, "INVENTORY_UPSERT", salaryItem);

              const msg = `Recebeu pagamento de ${targetEvent.payload.salary} ${targetEvent.payload.currency}.`;
              mEventsStore.addLog({
                eventId: targetEvent.id,
                characterId: workerId,
                message: msg
              });
              dispatchDiscordLog("PLAYER", "Painel de Eventos", msg, [{
                title: targetEvent.title,
                description: msg,
                color: 1752220,
                author: { name: workerId }
              }]);
            });

            RetroToast.success(`[EMPREGO] ${workers.length} trabalhador(es) pago(s)! Evento encerrado.`);
          }

          mEventsStore.removeEvent(targetEvent.id);
          useNetworkStore.getState().sendPayload("ALL", "EVENT_SYNC", { action: "DELETE", eventId: targetEvent.id });
        }

        if (data.action === "BUY_ITEM" && targetEvent.type === "MARKET") {
          const charId = data.characterId;
          const itemId = data.itemId;
          const price = data.price;

          const itemIndex = targetEvent.payload.items.findIndex((i: any) => i.itemId === itemId);
          if (itemIndex > -1) {
            const marketItem = targetEvent.payload.items[itemIndex];
            let outOfStock = false;

            if (marketItem.stockLimit !== null) {
              if (marketItem.stockLimit <= 0) {
                outOfStock = true;
              }
            }

            if (!outOfStock) {
              // Update stock
              const newItems = [...targetEvent.payload.items];
              if (newItems[itemIndex].stockLimit !== null) {
                newItems[itemIndex].stockLimit! -= 1;
              }

              const newEvent = {
                ...targetEvent,
                payload: {
                  ...targetEvent.payload,
                  items: newItems
                }
              };

              mEventsStore.updateEvent(newEvent.id, newEvent);

              // Get item from master database
              const masterItem = useMasterStore.getState().globalItems.find((i: any) => i.id === itemId);

              const purchasedItem = masterItem ? {
                ...masterItem,
                id: nanoid()
              } : {
                id: nanoid(),
                name: itemId,
                type: "CONSUMABLE",
                quantity: 1,
                slots: 1,
                isCarried: true,
                isEquipped: false,
                parentId: null,
                drawer: null,
                effects: [],
                description: "",
                svgId: "consumable",
                price: price,
                uses: 1,
                maxUses: 1,
                commsType: "DEFAULT",
                instantActions: [],
              };

              useNetworkStore.getState().sendPayload(charId, "INVENTORY_UPSERT", purchasedItem);

              const msg = `Comprou ${itemId} por ${price} ${targetEvent.payload.currency}.`;
              mEventsStore.addLog({
                eventId: targetEvent.id,
                characterId: charId,
                message: msg
              });
              dispatchDiscordLog("PLAYER", "Painel de Eventos", msg, [{
                title: targetEvent.title,
                description: msg,
                color: 3066993,
                author: { name: charId }
              }]);

              RetroToast.success(`[MERCADO] ${charId} comprou ${itemId}!`);

              useNetworkStore.getState().sendPayload("ALL", "EVENT_SYNC", { action: "UPSERT", event: newEvent });
            } else {
              RetroToast.warning(`[MERCADO] ${charId} tentou comprar ${itemId}, mas está esgotado.`);
            }
          }
        }

        if (data.action === "START_TEST" && targetEvent.type === "TEST") {
          const charId = data.characterId;

          const msg = `Iniciou o teste. Resultado será enviado separadamente.`;
          mEventsStore.addLog({
            eventId: targetEvent.id,
            characterId: charId,
            message: msg
          });
          dispatchDiscordLog("PLAYER", "Painel de Eventos", msg, [{
            title: targetEvent.title,
            description: msg,
            color: 3447003,
            author: { name: charId }
          }]);

          RetroToast.info(`[TESTE] ${charId} iniciou a rolagem!`);
        }

        if (data.action === "JOIN_COMBAT" && targetEvent.type === "COMBAT") {
          const newParticipant = data.participant;
          const newEvent = {
            ...targetEvent,
            payload: {
              ...targetEvent.payload,
              participants: {
                ...targetEvent.payload.participants,
                [newParticipant.name]: newParticipant
              }
            }
          };

          mEventsStore.updateEvent(newEvent.id, newEvent);

          const msg = `Entrou no combate com iniciativa ${newParticipant.initiative}.`;
          mEventsStore.addLog({
            eventId: newEvent.id,
            characterId: newParticipant.name,
            message: msg
          });
          dispatchDiscordLog("PLAYER", "Painel de Eventos", msg, [{
            title: newEvent.title,
            description: msg,
            color: 16711680,
            author: { name: newParticipant.name }
          }]);

          RetroToast.success(`[COMBATE] ${newParticipant.name} rolou a iniciativa e entrou no combate!`);

          // Re-broadcast updated event
          useNetworkStore.getState().sendPayload("ALL", "EVENT_SYNC", { action: "UPSERT", event: newEvent });
        }
      }
      removeQueueItem(current.id);
      return;
    }

    if (current.type === "REMOVE_EFFECT") {
      processingIdRef.current = current.id;
      if (activeNpcNames.includes(current.targetName)) {
        const charStore = useCharacterStore.getState();
        const isNpc = npcs.find((n) => n.name === current.targetName);
        let needsRestore = false;
        let tempBackup: any = null;
        if (isNpc && charStore.name !== current.targetName) {
          needsRestore = true;
          tempBackup = extractCharacterData(charStore);
          useCharacterStore.getState().importCharacterData({ ...isNpc, isMasterMode: true });
        }
        const data = current.data as { id: number };
        useCharacterStore.getState().removeCustomEffect(data.id);
        RetroToast.warning(`O MESTRE REMOVEU UM EFEITO DE [${current.targetName}].`);

        if (isNpc) {
          useMasterStore.getState().updateNpcData(isNpc.id, useCharacterStore.getState());
          if (needsRestore && tempBackup) {
            useCharacterStore.getState().importCharacterData(tempBackup);
          }
        }
      } else {
        const data = current.data as { id: number };
        removeCustomEffect(data.id);
        RetroToast.warning("O MESTRE REMOVEU UM EFEITO.");
      }

      removeQueueItem(current.id);
      return;
    }

    const isMasterToNpc =
      (current.attackerName === "MESTRE" || current.attackerName === useCharacterStore.getState().name) &&
      activeNpcNames.includes(current.targetName);
    if (isMasterToNpc) {
      const npc = npcs.find((n) => n.name === current.targetName);
      if (npc) {
        let needsRestore = false;
        let tempBackup: any = null;
        const charStore = useCharacterStore.getState();
        if (charStore.name !== current.targetName) {
          needsRestore = true;
          tempBackup = extractCharacterData(charStore);
          useCharacterStore.getState().importCharacterData({ ...npc, isMasterMode: true, sandboxMode: npc.type === "NON_HUMAN" });
        }

        if (current.type === "COMBAT_DEFENSE") {
          const data = current.data as { damage: number };
          useCharacterStore.getState().applyDamage(data.damage, "IGNORE", null);
        } else if (current.type === "ACTION") {
          useCharacterStore.getState().processDirectAction(current.data as InstantAction);
        } else if (current.type === "ITEM") {
          const itemData = current.data as Item;
          if (itemData.isSoulBound) {
            useCharacterStore.getState().addInventoryItem({ ...itemData, id: crypto.randomUUID(), parentId: null, isCarried: true, isEquipped: true });
          } else {
            useCharacterStore.getState().addInventoryItem({ ...itemData, id: crypto.randomUUID(), parentId: null, isCarried: true, isEquipped: false });
          }
        } else if (current.type === "XP") {
          useCharacterStore.getState().addXp((current.data as { amount: number }).amount);
        } else if (current.type === "EFFECT") {
          useCharacterStore.getState().addCustomEffect({ ...(current.data as CustomEffect), id: Date.now() + Math.random(), link: null });
        } else if (current.type === "NOTE") {
          const payloadData = current.data as { note: Note; effects: CustomEffect[] };
          useCharacterStore.getState().importExternalNote(payloadData.note, payloadData.effects);
        } else if (current.type === "FULL_OVERRIDE") {
          useCharacterStore.getState().importCharacterData(current.data as Partial<CharacterStore>);
        }

        useMasterStore.getState().updateNpcData(npc.id, useCharacterStore.getState());
        if (needsRestore && tempBackup) {
          useCharacterStore.getState().importCharacterData(tempBackup);
        }
      }
      removeQueueItem(current.id);
      if (processingIdRef.current === current.id) processingIdRef.current = null;
      return;
    }


    if (!anyVitalsModalOpen) {
      if (activeNpcNames.includes(current.targetName)) {
        const charStore = useCharacterStore.getState();
        const npc = npcs.find((n) => n.name === current.targetName);
        if (npc && charStore.name !== current.targetName) {
          if (!useMasterStore.getState().masterBackup) {
            useMasterStore.getState().setMasterBackup(charStore);
          }
          useCharacterStore.getState().importCharacterData({ ...npc, isMasterMode: true, sandboxMode: npc.type === "NON_HUMAN" });
        }
      }

      processingIdRef.current = current.id;

      if (current.type === "COMBAT_DEFENSE") {
        const payloadData = current.data as {
          attackRoll: number;
          damage: number;
          attackerName: string;
          targetId?: string;
          targetName?: string;
        };
        vitals.openDefenseModal({
          attackRoll: payloadData.attackRoll,
          damage: payloadData.damage,
          attackerName: payloadData.attackerName,
          targetId: payloadData.targetId || current.targetName,
          targetName: payloadData.targetName || current.targetName,
        });
        removeQueueItem(current.id);
        processingIdRef.current = null;
        return;
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

  if (["COMBAT_DEFENSE", "REMOVE_EFFECT"].includes(current.type)) return null;

  if (current.type === "REST_REQUEST") {
    const handleSendRest = () => {
      const config = { temperature: restTemp, comfort: restComfort, difficulty: restDiff };
      useMasterStore.getState().setLastRestSettings(config);
      useNetworkStore.getState().sendPayload(current.attackerName, "REST_RESPONSE", config);
      RetroToast.success(`CONDIÇÕES ENVIADAS PARA ${current.attackerName}`);
      removeQueueItem(current.id);
      processingIdRef.current = null;
    };

    return (
      <Modal
        isOpen={true}
        onClose={() => { }}
        title={`PEDIDO DE DESCANSO [${activeQueue.length} RESTANTES]`}
        maxWidth="max-w-md"
      >
        <div className="flex flex-col gap-4 text-center">
          <div className="bg-[var(--theme-accent)]/10 border border-[var(--theme-accent)] p-4">
            <span className="text-[14px] tracking-widest text-[var(--theme-accent)] font-black block uppercase mb-2">
              SOLICITANTE: {current.attackerName}
            </span>
            <span className="text-xs font-mono text-[var(--theme-text)]/70 uppercase">
              Defina as variáveis ambientais do local atual do jogador para o descanso longo.
            </span>
          </div>

          <div className="flex flex-col gap-4 p-4 border border-[var(--theme-border)] bg-[var(--theme-background)]">
            <Slider
              title="TEMPERATURA"
              min={-3}
              max={3}
              value={restTemp}
              onChange={setRestTemp}
              labelMap={{
                [-3]: "MUITO FRIO", [-2]: "FRIO DESCONFORTÁVEL", [-1]: "FRIO",
                0: "IRREGULAR", 1: "ESTÁVEL", 2: "CONFORTÁVEL", 3: "IDEAL"
              }}
            />

            <Slider
              title="CONFORTO / ABRIGO"
              min={-3}
              max={3}
              value={restComfort}
              onChange={setRestComfort}
              labelMap={{
                [-3]: "CHÃO PURO", [-2]: "TAPETE", [-1]: "COLCHÃO DURO",
                0: "CAMA DE CAMPANHA", 1: "COBERTA E TRAVESSEIRO", 2: "CAMA CONFORTÁVEL", 3: "LENÇÓIS DE SEDA"
              }}
            />

            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[10px] font-bold tracking-widest text-[var(--theme-warning)] uppercase">
                DIFICULDADE DA ÁREA (DC)
              </span>
              <div className="flex gap-2">
                <Button
                  className={`flex-1 ${restDiff === 10 ? "border-[var(--theme-warning)] bg-[var(--theme-warning)]/20 text-[var(--theme-warning)]" : "border-dashed opacity-50"}`}
                  onClick={() => setRestDiff(10)}
                  variant="primary"
                >
                  FÁCIL (10)
                </Button>
                <Button
                  className={`flex-1 ${restDiff === 15 ? "border-[var(--theme-warning)] bg-[var(--theme-warning)]/20 text-[var(--theme-warning)]" : "border-dashed opacity-50"}`}
                  onClick={() => setRestDiff(15)}
                  variant="primary"
                >
                  MÉDIO (15)
                </Button>
                <Button
                  className={`flex-1 ${restDiff === 20 ? "border-[var(--theme-warning)] bg-[var(--theme-warning)]/20 text-[var(--theme-warning)]" : "border-dashed opacity-50"}`}
                  onClick={() => setRestDiff(20)}
                  variant="primary"
                >
                  DIFÍCIL (20)
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <Button
              variant="danger"
              onClick={() => { removeQueueItem(current.id); processingIdRef.current = null; }}
              className="flex-1 border-dashed"
            >
              IGNORAR
            </Button>
            <Button
              variant="primary"
              onClick={handleSendRest}
              className="flex-[2] shadow-[0_0_10px_var(--theme-accent)] animate-pulse"
            >
              ENVIAR CONFIGURAÇÃO
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

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

  const loadNpcIfTarget = () => {
    if (activeNpcNames.includes(current.targetName)) {
      const charStore = useCharacterStore.getState();
      const npc = npcs.find((n) => n.name === current.targetName);
      if (npc && charStore.name !== current.targetName) {
        if (!useMasterStore.getState().masterBackup) {
          useMasterStore.getState().setMasterBackup(charStore);
        }
        useCharacterStore.getState().importCharacterData({ ...npc, isMasterMode: true });
      }
      return npc;
    }
    return null;
  };

  const saveAndRestoreNpc = (npc: any) => {
    if (npc) {
      useMasterStore.getState().updateNpcData(npc.id, useCharacterStore.getState());
      const backup = useMasterStore.getState().masterBackup;
      if (backup) {
        useCharacterStore.getState().importCharacterData(backup);
        useMasterStore.getState().setMasterBackup(null);
      }
    }
  };

  const handleAccept = () => {
    const npc = loadNpcIfTarget();

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
        useCharacterStore.getState().addInventoryItem(boundItem);
        RetroToast.warning("ITEM VINCULADO À ALMA EQUIPADO AUTOMATICAMENTE.");
      } else {
        const newItem: MasterItem = {
          ...itemData,
          id: crypto.randomUUID(),
          parentId: null,
          isCarried: true,
          isEquipped: false,
          folderId: null,
        };
        useMasterStore.getState().addGlobalItem(newItem);
        RetroToast.success(`MATÉRIA RECEBIDA NO ARSENAL: [${newItem.name}]`);
      }
    } else if (current.type === "XP") {
      const xpData = current.data as { amount: number };
      useCharacterStore.getState().addXp(xpData.amount);
      RetroToast.success(`EXPERIÊNCIA RECEBIDA: +${xpData.amount} XP`);
    } else if (current.type === "EFFECT") {
      const newEffect: CustomEffect = {
        ...(current.data as CustomEffect),
        id: Date.now() + Math.random(),
        link: null,
      };
      useCharacterStore.getState().addCustomEffect(newEffect);
      RetroToast.success(`EFEITO APLICADO: [${newEffect.description}]`);
    } else if (current.type === "ROLL_REQUEST") {
      const req = current.data as {
        title: string;
        rollKey: string;
        rollCategory: string;
        dc?: number;
      };
      const attrs = useCharacterStore.getState().attributes;
      const skls = useCharacterStore.getState().skills;
      let baseVal = 0;
      if (req.rollKey in attrs)
        baseVal = attrs[req.rollKey as keyof typeof attrs];
      if (req.rollKey in skls)
        baseVal = skls[req.rollKey as keyof typeof skls];
      initiateRoll(
        req.title,
        `${VG_CONFIG.rules.mainDice}+${baseVal}`,
        [req.rollKey, req.rollCategory],
        req.dc,
      );
    } else if (current.type === "ACTION") {
      const actionData = current.data as InstantAction;
      useCharacterStore.getState().processDirectAction(actionData);
      RetroToast.success(`AÇÃO IMEDIATA: [${actionData.description}]`);
    } else if (current.type === "NOTE") {
      const payloadData = current.data as {
        note: Note;
        effects: CustomEffect[];
      };
      useCharacterStore.getState().importExternalNote(payloadData.note, payloadData.effects);
      RetroToast.success(`NOTA INCORPORADA: [${payloadData.note.title}]`);
    } else if (current.type === "FULL_OVERRIDE") {
      useCharacterStore
        .getState()
        .importCharacterData(current.data as Partial<CharacterStore>);
      RetroToast.success("FICHA SINCRONIZADA COM O MAINFRAME.");
      useNetworkStore.getState().sendPayload("MESTRE", "OVERRIDE_ACCEPTED", {
        playerName: current.targetName,
      });
    }

    saveAndRestoreNpc(npc);

    removeQueueItem(current.id);
    processingIdRef.current = null;
  };

  const handleReject = () => {
    removeQueueItem(current.id);
    processingIdRef.current = null;
  };

  return (
    <Modal
      isOpen={true}
      onClose={() => { }}
      title={`TRANSMISSÃO RECEBIDA [${activeQueue.length} RESTANTES]`}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col gap-4 text-center">
        <div className="bg-[var(--theme-warning)]/10 border border-[var(--theme-warning)] p-4">
          <span className="text-[10px] tracking-widest text-[var(--theme-warning)] font-bold block uppercase mb-2">
            ALVO: {current.targetName} | ORIGEM: {current.attackerName}
          </span>

          {current.type === "ITEM" && (
            <div className="flex flex-col items-center gap-2 pointer-events-none mt-4 border border-[var(--theme-accent)]">
              <ItemNodeV2
                item={current.data as Item}
                allInventory={[]}
                onEdit={() => { }}
                onDelete={() => { }}
                onToggleEquip={() => { }}
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
        </div>

        <div className="flex gap-2 mt-2">
          {current.type !== "FULL_OVERRIDE" && (
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
