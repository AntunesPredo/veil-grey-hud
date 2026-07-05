import { Input } from "../../../../shared/ui/Form";
import type { MerchantEvent } from "../../../../shared/types/events";

interface MerchantEventFormProps {
  payload: Partial<MerchantEvent["payload"]>;
  onChange: (payload: Partial<MerchantEvent["payload"]>) => void;
}

export function MerchantEventForm({ payload, onChange }: MerchantEventFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-400">Nome do Mercador</label>
        <Input
          value={payload.merchantName || ""}
          onChange={(e) => onChange({ ...payload, merchantName: e.target.value })}
          placeholder="Ex: Zecke (Mercador de Sucata)"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-400">Margem de Desvalorização (%)</label>
        <Input
          type="number"
          value={payload.devaluationMargin || ""}
          onChange={(e) => onChange({ ...payload, devaluationMargin: parseInt(e.target.value) || 0 })}
          placeholder="Ex: 30 (Ele compra itens 30% mais barato)"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-400">Impacto de Desgaste (Wear %)</label>
        <Input
          type="number"
          value={payload.wearImpact || ""}
          onChange={(e) => onChange({ ...payload, wearImpact: parseInt(e.target.value) || 0 })}
          placeholder="Ex: 100 (Ele não compra itens desgastados)"
        />
      </div>
    </div>
  );
}

