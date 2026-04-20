import { Input, Checkbox } from "../../../shared/ui/Form";
import type { ItemFormData } from "../ItemModal";

export function ContainerConfig({
  formData,
  setFormData,
  isEquipable,
}: {
  formData: ItemFormData;
  setFormData: React.Dispatch<React.SetStateAction<ItemFormData>>;
  isEquipable: boolean;
}) {
  const hasCapacity = (formData.containerProps?.slotCapacity || 0) > 0;

  return (
    <div className="bg-[var(--theme-success)]/10 border border-[var(--theme-success)]/30 p-3 flex flex-col gap-3">
      {isEquipable && (
        <Checkbox
          label="HABILITAR COMPARTIMENTO DE CARGA"
          checked={hasCapacity}
          onChange={() =>
            setFormData((prev) => ({
              ...prev,
              containerProps:
                (prev.containerProps?.slotCapacity ?? 0) > 0
                  ? {
                      ...prev.containerProps,
                      slotCapacity: 0,
                      slotReduction: 0,
                    }
                  : {
                      ...prev.containerProps,
                      slotCapacity: 5,
                      slotReduction: 5,
                    },
            }))
          }
        />
      )}

      {hasCapacity && (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-[var(--theme-success)] tracking-widest uppercase">
              CAPACIDADE (SLOTS)
            </span>
            <Input
              type="number"
              min="1"
              value={formData.containerProps.slotCapacity}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  containerProps: {
                    ...prev.containerProps,
                    slotCapacity: parseInt(e.target.value) || 1,
                  },
                }))
              }
              className="text-center font-mono border-[var(--theme-success)]/50 text-[var(--theme-success)]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-[var(--theme-success)] tracking-widest uppercase">
              REDUÇÃO DE PESO
            </span>
            <Input
              type="number"
              min="0"
              value={formData.containerProps.slotReduction}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  containerProps: {
                    ...prev.containerProps,
                    slotReduction: Math.min(
                      parseInt(e.target.value) || 0,
                      prev.containerProps.slotCapacity,
                    ),
                  },
                }))
              }
              className="text-center font-mono border-[var(--theme-success)]/50 text-[var(--theme-success)]"
            />
            <span className="text-[8px] text-[var(--theme-success)]/70 text-right">
              Não excede capacidade.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
