import { Input } from "../../../../shared/ui/Form";
import type { JobEvent } from "../../../../shared/types/events";

interface JobEventFormProps {
  payload: Partial<JobEvent["payload"]>;
  onChange: (payload: Partial<JobEvent["payload"]>) => void;
}

export function JobEventForm({ payload, onChange }: JobEventFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-400">Nome do Empregador</label>
        <Input
          value={payload.employerName || ""}
          onChange={(e) => onChange({ ...payload, employerName: e.target.value })}
          placeholder="Ex: Megacorp inc."
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-400">Moeda do Pagamento</label>
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
        <label className="text-xs font-bold text-slate-400">Salário (Recompensa)</label>
        <Input
          type="number"
          value={payload.salary || ""}
          onChange={(e) => onChange({ ...payload, salary: parseInt(e.target.value) || 0 })}
          placeholder="Ex: 500"
        />
      </div>
    </div>
  );
}

