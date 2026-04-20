import { Input } from "../../../shared/ui/Form";
import type { ItemFormData } from "../ItemModal";

interface BaseMetricsProps {
  formData: ItemFormData;
  setFormData: React.Dispatch<React.SetStateAction<ItemFormData>>;
  allowStack: boolean;
}

export function BaseMetrics({
  formData,
  setFormData,
  allowStack,
}: BaseMetricsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-[var(--theme-accent)] tracking-widest uppercase">
          PESO (SLOTS)
        </span>
        <Input
          type="number"
          min="0"
          value={formData.slots}
          onChange={(e) =>
            setFormData((p) => ({
              ...p,
              slots: parseInt(e.target.value) || 0,
            }))
          }
          className="text-center font-mono"
        />
      </div>
      <div
        className={`flex flex-col gap-1 ${!allowStack && "opacity-30 pointer-events-none"}`}
      >
        <span className="text-[10px] font-bold text-[var(--theme-accent)] tracking-widest uppercase">
          QUANTIDADE
        </span>
        <Input
          type="number"
          min="1"
          value={allowStack ? formData.quantity : 1}
          onChange={(e) =>
            allowStack &&
            setFormData((p) => ({
              ...p,
              quantity: parseInt(e.target.value) || 1,
            }))
          }
          className="text-center font-mono"
        />
      </div>
    </div>
  );
}
