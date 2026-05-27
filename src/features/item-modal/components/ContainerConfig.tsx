import { Input, Checkbox } from "../../../shared/ui/Form";
import type { ItemFormData } from "../ItemModal";

export function ContainerConfig({
  formData,
  setFormData,
}: {
  formData: ItemFormData;
  setFormData: React.Dispatch<React.SetStateAction<ItemFormData>>;
}) {
  const hasCapacity = formData.hasContainerProps;

  return (
    <div className="bg-[var(--theme-success)]/10 border border-[var(--theme-success)]/30 p-3 flex flex-col gap-3">
      <Checkbox
        label="HABILITAR COMPARTIMENTO DE CARGA"
        checked={hasCapacity}
        onChange={() =>
          setFormData((prev) => ({
            ...prev,
            hasContainerProps: !prev.hasContainerProps,
            containerProps: prev.hasContainerProps
              ? null
              : {
                  drawers: prev.containerProps?.drawers || [],
                  slotCapacity: 5,
                  slotReduction: 5,
                },
          }))
        }
      />

      {hasCapacity && (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-[var(--theme-success)] tracking-widest uppercase">
              CAPACIDADE (SLOTS)
            </span>
            <Input
              type="number"
              min="1"
              value={formData.containerProps?.slotCapacity || 1}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  containerProps: prev.containerProps
                    ? {
                        ...prev.containerProps!,
                        slotCapacity: parseInt(e.target.value) || 1,
                      }
                    : null,
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
              value={formData.containerProps?.slotReduction || 0}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  containerProps: prev.containerProps
                    ? {
                        ...prev.containerProps!,
                        slotReduction: Math.min(
                          parseInt(e.target.value) || 0,
                          prev.containerProps!.slotCapacity,
                        ),
                      }
                    : null,
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
