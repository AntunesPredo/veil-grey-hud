import { Input } from "../../../shared/ui/Form";
import type { ItemFormData } from "../ItemModal";

export function ActiveCondition({
  formData,
  onActiveChange,
}: {
  formData: ItemFormData;
  onActiveChange: (f: "condition" | "quality", v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 bg-[var(--theme-danger)]/10 border border-[var(--theme-danger)]/30 p-3">
      <span className="text-[10px] font-bold text-[var(--theme-danger)] tracking-widest uppercase">
        ESTADO DO EQUIPAMENTO
      </span>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-[var(--theme-danger)] tracking-widest uppercase">
            QUALIDADE (MULT)
          </span>
          <select
            className="bg-[var(--theme-background)] border border-[var(--theme-danger)]/50 text-[var(--theme-danger)] p-1.5 font-mono text-xs outline-none"
            value={formData.quality}
            onChange={(e) =>
              onActiveChange("quality", parseFloat(e.target.value))
            }
          >
            <option value={8}>ALTA (x8)</option>
            <option value={4}>MÉDIA (x4)</option>
            <option value={2.5}>BAIXA (x2.5)</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-[var(--theme-danger)] tracking-widest uppercase">
            CONDIÇÃO (1-100)
          </span>
          <Input
            type="number"
            min="1"
            max="100"
            value={formData.condition}
            onChange={(e) =>
              onActiveChange("condition", parseInt(e.target.value) || 1)
            }
            className="text-center font-mono border-[var(--theme-danger)]/50 text-[var(--theme-danger)]"
          />
        </div>
      </div>
      <div className="flex justify-between items-center border-t border-dashed border-[var(--theme-danger)]/50 pt-2">
        <span className="text-[10px] font-bold text-[var(--theme-danger)]">
          MÁXIMO DE USOS:
        </span>
        <span className="font-mono text-[var(--theme-danger)] font-bold">
          {formData.maxUses} CARGAS
        </span>
      </div>
    </div>
  );
}
