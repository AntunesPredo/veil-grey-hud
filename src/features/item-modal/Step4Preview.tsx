import { motion } from "framer-motion";
import { ItemNodeWrapper } from "../inventory/components/ItemNodeWrapper";
import type { ItemFormData } from "./ItemModal";
import { buildFinalItem } from "./buildFinalItem";

interface Step4PreviewProps {
  formData: ItemFormData;
}

export function Step4Preview({ formData }: Step4PreviewProps) {
  const mockItem = buildFinalItem(formData);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6 pt-2"
    >
      <div className="flex flex-col items-center text-center gap-2">
        <span className="text-[10px] font-bold text-[var(--theme-accent)] tracking-widest uppercase border-b border-[var(--theme-accent)]/30 pb-1">
          ANÁLISE DE ESTRUTURA (PRÉVIA)
        </span>
        <span className="text-xs text-[var(--theme-text)]/70">
          Valide a assinatura de dados antes da síntese final na matriz.
        </span>
      </div>

      <div className="w-full pointer-events-none p-4 bg-[var(--theme-background)]/40 border border-dashed border-[var(--theme-border)] flex justify-center">
        <div className="w-full max-w-[340px]">
          <ItemNodeWrapper
            item={mockItem}
            allInventory={[]}
            onEdit={() => {}}
            onDelete={() => {}}
            activeDragId={null}
            isEditMode={false}
            isOverlay={true}
          />
        </div>
      </div>
    </motion.div>
  );
}
