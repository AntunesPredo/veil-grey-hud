import { useState } from "react";
import { Modal } from "../../../shared/ui/Overlays";
import { Button, NumberInput } from "../../../shared/ui/Form";
import { TargetSelectionModal } from "../../../shared/ui/TargetSelectionModal";
import { useNetworkStore } from "../../../shared/store/useNetworkStore";
import { RetroToast } from "../../../shared/ui/RetroToast";
import { CcLogo, FccLogo } from "../../../shared/ui/Icons";
import { useMasterStore } from "../masterStore";
import { generateTransferId } from "../../../shared/utils/generateTransferId";
import { dispatchDiscordLog } from "../../../shared/utils/discordWebhook";

interface BroadcastFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BroadcastFundsModal({
  isOpen,
  onClose,
}: BroadcastFundsModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<"CC" | "FCC">("CC");
  const [mode, setMode] = useState<"FUNDS" | "DEBT">("FUNDS");
  const [isTargetModalOpen, setTargetModalOpen] = useState(false);

  const handleSend = (targets: string[]) => {
    const numericAmount = Math.round(Number(amount));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      RetroToast.error("QUANTIDADE INVÁLIDA.");
      return;
    }

    const channel = useNetworkStore.getState().channel;
    if (!channel) {
      RetroToast.error("SEM CONEXÃO DE REDE.");
      return;
    }

    const itemPayload = {
      id: crypto.randomUUID(),
      name: `Carteira ${currency}`,
      description: `Fundos transferidos pela rede: $${numericAmount} ${currency}`,
      weight: 0,
      quantity: 1,
      isCarried: true,
      isEquipped: false,
      isBlueprint: false,
      isConsumable: false,
      isSoulBound: true,
      parentId: null,
      price: numericAmount,
      wallet: {
        type: currency,
        value: numericAmount,
      }
    };

    targets.forEach((target) => {
      const transferId = generateTransferId();
      const updatedItemPayload = { ...itemPayload, id: transferId };

      if (target === "ALL") {
        const onlinePlayers = useNetworkStore.getState().onlinePlayers;
        onlinePlayers.forEach((p) => {
          if (p !== "MESTRE" && p !== "SANDBOX") {
            sendFundsToPlayer(p, updatedItemPayload, transferId);
          }
        });
      } else {
        sendFundsToPlayer(target, updatedItemPayload, transferId);
      }
    });

    RetroToast.success(`OPERAÇÃO ENVIADA ($${numericAmount} ${currency}).`);
    setAmount("");
    onClose();
  };

  const sendFundsToPlayer = (target: string, itemData: any, transferId: string) => {
    const isLocalNpc = useMasterStore.getState().npcs.find((n) => n.name === target);
    if (isLocalNpc) {
      const npc = isLocalNpc;
      const newInv = [...(npc.inventory || []), { ...itemData, id: transferId }];
      useMasterStore.getState().updateNpcData(npc.id, { inventory: newInv });
    } else {
      useNetworkStore.getState().sendPayload(target, mode, {
        amount: itemData.wallet.value,
        currency: itemData.wallet.type,
        transferId
      });

      const opText = mode === "FUNDS" ? "Transferiu Fundos para" : "Cobrou Dívida de";
      const msg = `${opText} ${target}: ${itemData.wallet.value} ${itemData.wallet.type}. ID: ${transferId}`;
      dispatchDiscordLog("PLAYER", "Operações Financeiras", msg, [{
        title: "Transação Direta",
        description: msg,
        color: mode === "FUNDS" ? 2067276 : 15548997
      }]);
    }
  };

  const isFormValid = amount !== "" && !isNaN(Number(amount)) && Number(amount) > 0;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="BROADCAST DE TRANSAÇÕES">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 bg-[var(--theme-background)] p-4 border border-[var(--theme-border)] relative [clip-path:polygon(8px_0,100%_0,100%_calc(100%-8px),calc(100%-8px)_100%,0_100%,0_8px)]">
            <label className="text-[10px] font-bold text-[var(--theme-accent)] opacity-80 tracking-widest uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-[var(--theme-accent)] inline-block"></span>
              TIPO DE OPERAÇÃO:
            </label>
            <div className="flex gap-2">
              <Button
                variant={mode === "FUNDS" ? "success" : "primary"}
                onClick={() => setMode("FUNDS")}
                className="flex-1"
              >
                ENVIAR FUNDOS
              </Button>
              <Button
                variant={mode === "DEBT" ? "danger" : "primary"}
                onClick={() => setMode("DEBT")}
                className={`flex-1 ${mode === "DEBT" ? "bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.3)_10px,rgba(0,0,0,0.3)_20px)]" : ""}`}
              >
                COBRAR DÍVIDA
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2 bg-[var(--theme-background)] p-4 border border-[var(--theme-border)] relative">
            <label className="text-[10px] font-bold text-[var(--theme-accent)] opacity-80 tracking-widest uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-[var(--theme-accent)] inline-block"></span>
              {mode === "FUNDS" ? "VALOR A ENVIAR:" : "VALOR DA DÍVIDA:"}
            </label>
            <div className="flex items-center gap-4 mt-2">
              {currency === "CC" ? (
                <CcLogo className={mode === "FUNDS" ? "text-[var(--theme-success)] w-10 h-10" : "text-[var(--theme-danger)] w-10 h-10"} />
              ) : (
                <FccLogo className={mode === "FUNDS" ? "text-[var(--theme-success)] w-10 h-10" : "text-[var(--theme-danger)] w-10 h-10"} />
              )}
              <NumberInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                className="flex-1"
                step={50}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 bg-[var(--theme-background)] p-4 border border-[var(--theme-border)] relative">
            <label className="text-[10px] font-bold text-[var(--theme-accent)] opacity-80 tracking-widest uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-[var(--theme-accent)] inline-block"></span>
              MOEDA:
            </label>
            <div className="flex gap-2">
              <Button
                variant={currency === "CC" ? "success" : "primary"}
                onClick={() => setCurrency("CC")}
                className="flex-1"
              >
                CORP CREDITS (CC)
              </Button>
              <Button
                variant={currency === "FCC" ? "warning" : "primary"}
                onClick={() => setCurrency("FCC")}
                className="flex-1"
              >
                FUCK CORP CREDITS (FCC)
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <Button variant="danger" onClick={onClose} className="border-dashed flex-1">
              CANCELAR
            </Button>
            <Button
              variant="primary"
              onClick={() => setTargetModalOpen(true)}
              disabled={!isFormValid}
              className="flex-1"
            >
              SELECIONAR ALVOS &gt;
            </Button>
          </div>
        </div>
      </Modal>

      <TargetSelectionModal
        isOpen={isTargetModalOpen}
        onClose={() => setTargetModalOpen(false)}
        onSelect={handleSend}
        title={`ENVIAR $${amount} ${currency} PARA:`}
        allowAll={true}
      />
    </>
  );
}
