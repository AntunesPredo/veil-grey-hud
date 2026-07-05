import { useState } from "react";
import { Modal } from "../../../shared/ui/Overlays";
import { Button, Input } from "../../../shared/ui/Form";
import type { DebtEvent } from "../../../shared/types/events";
import { useCharacterStore, type CharacterStore } from "../../character/store";
import { WalletSelectorDnd } from "../../../shared/ui/WalletSelectorDnd";
import { useNetworkStore } from "../../../shared/store/useNetworkStore";
import { RetroToast } from "../../../shared/ui/RetroToast";

interface DebtPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: DebtEvent;
}

export function DebtPaymentModal({ isOpen, onClose, event }: DebtPaymentModalProps) {
  const inventory = useCharacterStore((state: CharacterStore) => state.inventory);
  const characterId = useCharacterStore((state: CharacterStore) => state.name);
  const overwriteInventoryItem = useCharacterStore((state: CharacterStore) => state.overwriteInventoryItem);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  
  // Calculate remaining debt
  const myOwed = event.payload.debts[characterId] || 0;
  
  const [paymentAmount, setPaymentAmount] = useState<number>(myOwed);



  const selectedWallet = inventory.find((i: any) => i.id === selectedWalletId);
  const maxAvailable = selectedWallet?.wallet?.value || 0;

  const handlePay = () => {
    if (!selectedWalletId || !selectedWallet || !selectedWallet.wallet) return;
    
    const amount = Math.min(paymentAmount, myOwed, maxAvailable);
    if (amount <= 0) return;

    // Deduct from local inventory
    overwriteInventoryItem({
      ...selectedWallet,
      wallet: {
        ...selectedWallet.wallet,
        value: selectedWallet.wallet.value - amount,
      },
    });

    // Send payment telemetry to master
    useNetworkStore.getState().sendPayload("MESTRE", "EVENT_ACTION", {
      eventId: event.id,
      action: "PAY_DEBT",
      characterId,
      amount,
      walletName: selectedWallet.name,
    });

    RetroToast.success(`PAGAMENTO DE ${amount} ${event.payload.currency} ENVIADO!`);
    onClose();
  };

  return (
    <Modal title="PAGAMENTO DE DÍVIDA" onClose={onClose} isOpen={isOpen}>
      <div className="p-4 w-full min-w-[600px] flex flex-col gap-6">
        
        {/* INFO PANEL */}
        <div className="bg-slate-900 border-2 border-red-500/50 p-4 relative">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-white text-lg tracking-widest uppercase">{event.title}</h3>
            <span className="text-red-400 font-mono font-bold bg-red-900/30 px-2 py-1">
              FALTA: {myOwed} {event.payload.currency}
            </span>
          </div>
          <p className="text-slate-400 text-sm font-mono mb-4">{event.description}</p>
        </div>

        {/* WALLET SELECTION */}
        <div className="flex flex-col gap-2">
          <h4 className="text-[var(--theme-accent)] font-bold tracking-widest text-sm mb-1">
            SELECIONE A FONTE DE FUNDOS
          </h4>
          <WalletSelectorDnd
            inventory={inventory}
            currency={event.payload.currency}
            selectedWalletId={selectedWalletId}
            onSelect={setSelectedWalletId}
            onUnselect={() => setSelectedWalletId(null)}
          />
        </div>

        {/* PAYMENT INPUT */}
        {selectedWalletId && (
          <div className="bg-slate-900 border border-slate-700 p-4 animate-in fade-in slide-in-from-top-4">
            <label className="text-xs font-bold text-slate-400 block mb-2">VALOR DO PAGAMENTO</label>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    let val = parseInt(e.target.value) || 0;
                    if (val > maxAvailable) val = maxAvailable;
                    if (val > myOwed) val = myOwed;
                    setPaymentAmount(Math.max(0, val));
                  }}
                  min={0}
                  max={Math.min(myOwed, maxAvailable)}
                />
              </div>
              <Button
                variant="success"
                onClick={handlePay}
                disabled={paymentAmount <= 0}
                className="w-40 font-bold uppercase tracking-wider"
              >
                CONFIRMAR
              </Button>
            </div>
            <div className="text-xs font-mono mt-2 flex justify-between">
              <span className="text-emerald-400">SALDO DISPONÍVEL: {maxAvailable}</span>
              <span className="text-red-400">VALOR A PAGAR: {paymentAmount}</span>
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
}
