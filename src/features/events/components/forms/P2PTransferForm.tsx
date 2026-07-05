import { Input } from "../../../../shared/ui/Form";
import type { P2PTransferEvent } from "../../../../shared/types/events";
import { useNetworkStore } from "../../../../shared/store/useNetworkStore";

interface P2PTransferFormProps {
  payload: Partial<P2PTransferEvent["payload"]>;
  onChange: (payload: Partial<P2PTransferEvent["payload"]>) => void;
}

export function P2PTransferForm({ payload, onChange }: P2PTransferFormProps) {
  const telemetryData = useNetworkStore((state) => state.telemetryData);
  const players = Object.keys(telemetryData);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-400">Hospedeiro (Quem recebe a transferência base)</label>
        <select
          className="bg-[var(--theme-background)] border-2 border-[var(--theme-accent)]/50 text-[var(--theme-accent)] px-3 py-2 outline-none font-mono"
          value={payload.hostId || "MASTER"}
          onChange={(e) => onChange({ ...payload, hostId: e.target.value })}
        >
          <option value="MASTER">Mestre (NPC/Mundo)</option>
          {players.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

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
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-400">Pool Inicial (Fundos providos pelo Host)</label>
        <Input
          type="number"
          value={payload.pool || ""}
          onChange={(e) => onChange({ ...payload, pool: parseInt(e.target.value) || 0 })}
          placeholder="Ex: 0"
        />
      </div>
    </div>
  );
}

