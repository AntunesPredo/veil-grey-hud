import { Input, Checkbox } from "../../../../shared/ui/Form";
import type { DebtEvent } from "../../../../shared/types/events";

interface DebtEventFormProps {
  payload: Partial<DebtEvent["payload"]>;
  onChange: (payload: Partial<DebtEvent["payload"]>) => void;
}

export function DebtEventForm({ payload, onChange }: DebtEventFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-400">Moeda</label>
        <div className="grid grid-cols-2 gap-2">
          {["CC", "FCC"].map(curr => (
            <button
              key={curr}
              type="button"
              onClick={() => onChange({ ...payload, currency: curr as any })}
              className={"p-2 border-2 text-xs font-bold font-mono transition-colors rounded-none " + (
                (payload.currency || "CC") === curr 
                  ? "bg-[var(--theme-accent)]/20 border-[var(--theme-accent)] text-[var(--theme-accent)] shadow-[0_0_10px_var(--theme-accent)]" 
                  : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
              )}
            >
              {curr === "CC" ? "Credit Chips (CC)" : "Fed Credit Chips (FCC)"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-400">Valor Total (Cobrança)</label>
        <Input
          type="number"
          value={payload.totalAmount || ""}
          onChange={(e) => onChange({ ...payload, totalAmount: parseInt(e.target.value) || 0, remainingAmount: parseInt(e.target.value) || 0 })}
          placeholder="Ex: 1000"
        />
        <span className="text-[10px] text-slate-500 font-mono">Valor total da dívida cobrada.</span>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-400">Tipo de Dívida</label>
        <div className="grid grid-cols-2 gap-2">
          {["INDIVIDUAL", "JOINT"].map(dtype => (
            <button
              key={dtype}
              type="button"
              onClick={() => onChange({ ...payload, debtType: dtype as any })}
              className={"p-2 border-2 text-xs font-bold font-mono transition-colors rounded-none " + (
                (payload.debtType || "INDIVIDUAL") === dtype 
                  ? "bg-[var(--theme-accent)]/20 border-[var(--theme-accent)] text-[var(--theme-accent)] shadow-[0_0_10px_var(--theme-accent)]" 
                  : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
              )}
            >
              {dtype === "INDIVIDUAL" ? "INDIVIDUAL" : "CONJUNTA"}
            </button>
          ))}
        </div>
      </div>

      <Checkbox
        label="Dívida Fixa (Encerra automaticamente quando paga)"
        checked={payload.isFixed ?? true}
        onChange={(e) => onChange({ ...payload, isFixed: e.target.checked })}
      />
    </div>
  );
}

