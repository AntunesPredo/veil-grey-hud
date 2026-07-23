import { useState } from "react";
import { Modal } from "../../../shared/ui/Overlays";
import { Button } from "../../../shared/ui/Form";
import { WalletSelectorDnd } from "../../../shared/ui/WalletSelectorDnd";
import type { JobEvent } from "../../../shared/types/events";
import { useCharacterStore } from "../../character/store";

interface JobAcceptModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: JobEvent;
  onConfirm: (walletId: string) => void;
}

export function JobAcceptModal({ isOpen, onClose, event, onConfirm }: JobAcceptModalProps) {
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const inventory = useCharacterStore((state) => state.inventory);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ACEITAR EMPREGO">
      <div className="flex flex-col gap-4">
        <div className="bg-slate-800 p-4 border border-cyan-500/50 rounded flex flex-col items-center">
          <span className="text-sm font-bold text-slate-300">Empregador: <span className="text-white">{event.payload.employerName}</span></span>
          <span className="text-sm font-bold text-slate-300">
            Salário: <span className="text-emerald-400">{event.payload.salary} {event.payload.currency}</span>
          </span>
          {event.payload.isRecurring && (
            <span className="text-xs font-mono text-cyan-400 mt-2 bg-cyan-900/30 px-2 py-1 rounded">
              TRABALHO RECORRENTE
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 p-3 bg-slate-900/50 border border-slate-700">
          <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase text-center">
            SELECIONE A CARTEIRA PARA RECEBER OS PAGAMENTOS
          </label>
          <WalletSelectorDnd
            inventory={inventory}
            currency={event.payload.currency}
            selectedWalletId={selectedWalletId}
            onSelect={setSelectedWalletId}
            onUnselect={() => setSelectedWalletId("")}
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="danger" onClick={onClose} className="flex-1 border-dashed">
            CANCELAR
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              if (selectedWalletId) onConfirm(selectedWalletId);
            }} 
            disabled={!selectedWalletId}
            className="flex-[2]"
          >
            CONFIRMAR E ACEITAR
          </Button>
        </div>
      </div>
    </Modal>
  );
}
