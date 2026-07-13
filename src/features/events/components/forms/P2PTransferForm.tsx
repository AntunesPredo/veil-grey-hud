import { useState } from "react";
import { Input, Button } from "../../../../shared/ui/Form";
import type { P2PTransferEvent } from "../../../../shared/types/events";
import { TargetSelectionModal } from "../../../../shared/ui/TargetSelectionModal";

interface P2PTransferFormProps {
  payload: Partial<P2PTransferEvent["payload"]>;
  onChange: (payload: Partial<P2PTransferEvent["payload"]>) => void;
}

export function P2PTransferForm({ payload, onChange }: P2PTransferFormProps) {
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);

  const handleSelectHost = (targets: string[]) => {
    if (targets.length > 0) {
      onChange({ ...payload, hostId: targets[0] });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-400">HOST (Hospedeiro da Transferência)</label>
        <Button variant="primary" type="button" onClick={() => setIsTargetModalOpen(true)} className="font-mono">
          {payload.hostId ? `HOST ATUAL: ${payload.hostId}` : "SELECIONAR HOST"}
        </Button>
        <span className="text-[10px] text-slate-500 font-mono">O Host é o jogador ou NPC que receberá o montante final.</span>
      </div>
      
      {isTargetModalOpen && (
        <TargetSelectionModal
          isOpen={isTargetModalOpen}
          onClose={() => setIsTargetModalOpen(false)}
          onSelect={handleSelectHost}
          title="SELECIONAR HOST ÚNICO"
          allowAll={false}
          singleSelect={true}
        />
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-400">Moeda</label>
        <div className="grid grid-cols-2 gap-2">
          {["CC", "FCC"].map(curr => (
            <button
              key={curr}
              type="button"
              onClick={() => onChange({ ...payload, currency: curr as any })}
              className={`p-2 border-2 text-xs font-bold font-mono transition-colors rounded-none ${
                (payload.currency || "CC") === curr 
                  ? "bg-[var(--theme-accent)]/20 border-[var(--theme-accent)] text-[var(--theme-accent)] shadow-[0_0_10px_var(--theme-accent)]" 
                  : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
              }`}
            >
              {curr === "CC" ? "Credit Chips (CC)" : "Fed Credit Chips (FCC)"}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Tipo de moeda usada na transferência cooperativa.</span>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-400">Pool Inicial</label>
        <Input
          type="number"
          value={payload.pool ?? ""}
          onChange={(e) => onChange({ ...payload, pool: parseInt(e.target.value) || 0, initialPool: parseInt(e.target.value) || 0 })}
          placeholder="Ex: 0"
        />
        <span className="text-[10px] text-slate-500 font-mono">Valor financeiro já existente e provido pelo Host antes das contribuições.</span>
      </div>
    </div>
  );
}
