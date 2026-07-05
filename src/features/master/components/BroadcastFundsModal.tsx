import { useState } from "react";
import { Modal } from "../../../shared/ui/Overlays";
import { Button, Input } from "../../../shared/ui/Form";
import { TargetSelectionModal } from "../../../shared/ui/TargetSelectionModal";
import { useNetworkStore } from "../../../shared/store/useNetworkStore";
import { RetroToast } from "../../../shared/ui/RetroToast";
import { FiDollarSign } from "../../../shared/ui/Icons";
import { useMasterStore } from "../masterStore";

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
      if (target === "ALL") {
        // Enviar para todos online (exceto mestre)
        const onlinePlayers = useNetworkStore.getState().onlinePlayers;
        onlinePlayers.forEach((p) => {
          if (p !== "MESTRE" && p !== "SANDBOX") {
            sendFundsToPlayer(p, itemPayload);
          }
        });
      } else {
        sendFundsToPlayer(target, itemPayload);
      }
    });

    RetroToast.success(`OPERAÇÃO ENVIADA ($${numericAmount} ${currency}).`);
    setAmount("");
    onClose();
  };

  const sendFundsToPlayer = (target: string, itemData: any) => {
    const isLocalNpc = useMasterStore.getState().npcs.find((n) => n.name === target);
    if (isLocalNpc) {
       const npc = isLocalNpc;
       const newInv = [...(npc.inventory || []), { ...itemData, id: crypto.randomUUID() }];
       useMasterStore.getState().updateNpcData(npc.id, { inventory: newInv });
    } else {
       useNetworkStore.getState().sendPayload(target, mode, { 
         amount: itemData.wallet.value, 
         currency: itemData.wallet.type 
       });
    }
  };

  const isFormValid = amount !== "" && !isNaN(Number(amount)) && Number(amount) > 0;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="BROADCAST DE TRANSAÇÕES">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 bg-slate-800/50 p-4 border border-slate-700">
            <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
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
                className="flex-1"
              >
                COBRAR DÍVIDA
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2 bg-slate-800/50 p-4 border border-slate-700">
            <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
              {mode === "FUNDS" ? "VALOR A ENVIAR:" : "VALOR DA DÍVIDA:"}
            </label>
            <div className="flex items-center gap-2">
              <FiDollarSign className={mode === "FUNDS" ? "text-emerald-500 text-xl" : "text-red-500 text-xl"} />
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="text-xl font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 bg-slate-800/50 p-4 border border-slate-700">
            <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
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
