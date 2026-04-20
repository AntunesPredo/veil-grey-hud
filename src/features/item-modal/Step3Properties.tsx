import { motion } from "framer-motion";
import type { ItemFormData } from "./ItemModal";
import { Input } from "../../shared/ui/Form";
import { useSystemData } from "../../shared/hooks/useSystemData";
import type { Skill } from "../../shared/types/veil-grey";
import { IconSelector } from "./components/IconSelector";
import { BaseMetrics } from "./components/BaseMetrics";
import { ChargeConfig } from "./components/ChargeConfig";
import { ActiveCondition } from "./components/ActiveCondition";
import { ContainerConfig } from "./components/ContainerConfig";

interface Step3PropertiesProps {
  formData: ItemFormData;
  setFormData: React.Dispatch<React.SetStateAction<ItemFormData>>;
  icons: { id: string; svg: React.ReactNode }[];
}

export function Step3Properties({
  formData,
  setFormData,
  icons,
}: Step3PropertiesProps) {
  const { skills } = useSystemData();

  const isMaterial = formData.type === "MATERIAL";
  const isConsumable = formData.type === "CONSUMABLE";
  const isRechargeable = formData.type === "RECHARGEABLE";
  const isActive = formData.type === "ACTIVE";
  const isKit = formData.type === "KIT";
  const isContainer = formData.type === "CONTAINER";
  const isEquipable = formData.type === "EQUIPABLE";

  const allowStack = isMaterial || isConsumable;
  const allowEffects = !isMaterial && !isContainer && !isRechargeable;
  const hasCommsType = isConsumable || isRechargeable || isActive || isKit;

  const handleActiveChange = (field: "condition" | "quality", val: number) => {
    const newCondition = field === "condition" ? val : formData.condition;
    const newQuality = field === "quality" ? val : formData.quality;
    const newMaxUses = Math.floor(newCondition * newQuality);
    setFormData((prev) => ({
      ...prev,
      [field]: val,
      maxUses: newMaxUses,
      uses: newMaxUses,
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 max-h-[450px]"
    >
      <IconSelector
        formData={formData}
        setFormData={setFormData}
        icons={icons}
      />
      <BaseMetrics
        formData={formData}
        setFormData={setFormData}
        allowStack={allowStack}
      />

      {hasCommsType && (
        <div className="flex flex-col gap-1 bg-[var(--theme-accent)]/5 p-2 border border-[var(--theme-border)]">
          <span className="text-[10px] font-bold text-[var(--theme-accent)] tracking-widest uppercase">
            TIPO DE COMUNICAÇÃO / MUNIÇÃO
          </span>
          <Input
            type="text"
            placeholder="Ex: 9mm, Bateria Médica..."
            value={formData.commsType}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                commsType: e.target.value.toUpperCase(),
              }))
            }
            className="font-mono text-xs uppercase"
          />
        </div>
      )}

      {(isConsumable || isKit || isRechargeable) && (
        <ChargeConfig
          formData={formData}
          setFormData={setFormData}
          isConsumable={isConsumable}
        />
      )}
      {isActive && (
        <ActiveCondition
          formData={formData}
          onActiveChange={handleActiveChange}
        />
      )}

      {isRechargeable && (
        <div className="flex flex-col gap-1 bg-[var(--theme-success)]/10 border border-[var(--theme-success)]/30 p-3">
          <span className="text-[10px] font-bold text-[var(--theme-success)] tracking-widest uppercase">
            REDUÇÃO DE PESO INTERNO (POR ITEM)
          </span>
          <Input
            type="number"
            min="0"
            value={formData.perItemSlotReduction}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                perItemSlotReduction: parseInt(e.target.value) || 0,
              }))
            }
            className="text-center font-mono border-[var(--theme-success)]/50 text-[var(--theme-success)]"
          />
        </div>
      )}

      {(isContainer || isEquipable) && (
        <ContainerConfig
          formData={formData}
          setFormData={setFormData}
          isEquipable={isEquipable}
        />
      )}

      {isKit && (
        <div className="flex flex-col gap-1 bg-[var(--theme-accent)]/5 border border-[var(--theme-border)] p-3">
          <span className="text-[10px] font-bold text-[var(--theme-accent)] tracking-widest uppercase">
            VINCULAR PERÍCIA (OPCIONAL)
          </span>
          <select
            className="bg-[var(--theme-background)] border border-[var(--theme-border)] text-[var(--theme-accent)] p-2 font-mono text-xs outline-none focus:border-[var(--theme-accent)]"
            value={formData.skillId || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                skillId: (e.target.value as Skill) || null,
              }))
            }
          >
            <option value="">NENHUMA PERÍCIA ATRELADA</option>
            {skills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1 mt-2">
        <span className="text-[10px] font-bold text-[var(--theme-text)] tracking-widest uppercase">
          DESCRIÇÃO E LORE (OPCIONAL)
        </span>
        <textarea
          rows={3}
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          className="w-full bg-[var(--theme-background)] border border-[var(--theme-border)] p-2 text-sm text-[var(--theme-text)] font-mono outline-none focus:border-[var(--theme-accent)] transition-colors resize-none custom-scrollbar"
        />
      </div>

      {allowEffects ? (
        <div className="border-l-2 border-[var(--theme-accent)] bg-[var(--theme-accent)]/10 p-2 text-[10px] text-[var(--theme-accent)] font-mono italic">
          * O Módulo de Efeitos ficará disponível na tela principal do
          inventário.
        </div>
      ) : (
        <div className="border-l-2 border-[var(--theme-border)] bg-[var(--theme-background)] p-2 text-[10px] text-[var(--theme-text)]/50 font-mono italic">
          * Esta classe não suporta Efeitos de Status.
        </div>
      )}
    </motion.div>
  );
}
