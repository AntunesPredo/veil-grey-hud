import { motion } from "framer-motion";
import type { ItemFormData } from "./ItemModal";
import { Input, Checkbox } from "../../shared/ui/Form";
import { useSystemData } from "../../shared/hooks/useSystemData";
import type { Skill } from "../../shared/types/veil-grey";
import { IconSelector } from "./components/IconSelector";
import { BaseMetrics } from "./components/BaseMetrics";
import { ChargeConfig } from "./components/ChargeConfig";
import { ActiveCondition } from "./components/ActiveCondition";
import { ContainerConfig } from "./components/ContainerConfig";
import { getAllowedModes } from "../../shared/utils/effectUtils";

interface Step3PropertiesProps {
  formData: ItemFormData;
  setFormData: React.Dispatch<React.SetStateAction<ItemFormData>>;
  icons: { id: string; svg: React.ReactNode; viewBox: string }[];
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
  const allowedModes = getAllowedModes(formData.type);
  const allowEffects = allowedModes.length > 0;

  const hasCommsType =
    isConsumable ||
    isRechargeable ||
    isKit ||
    (isActive && formData.requiresAmmo);
  const showSkillBind = isKit || isActive;

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

      {isActive && (
        <div className="flex items-center gap-2 bg-[var(--theme-danger)]/10 p-2 border border-[var(--theme-danger)]/30">
          <Checkbox
            label="REQUER MUNIÇÃO / CARGA"
            checked={formData.requiresAmmo}
            onChange={() =>
              setFormData((p) => ({ ...p, requiresAmmo: !p.requiresAmmo }))
            }
          />
        </div>
      )}

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

      {isEquipable && (
        <div className="bg-[var(--theme-warning)]/10 border border-[var(--theme-warning)]/30 p-3 flex flex-col gap-3">
          <Checkbox
            label="PROPRIEDADES PROTETORAS"
            checked={formData.hasArmor}
            onChange={() =>
              setFormData((prev) => ({ ...prev, hasArmor: !prev.hasArmor }))
            }
          />

          {formData.hasArmor && (
            <div className="grid grid-cols-2 gap-4 border-t border-dashed border-[var(--theme-warning)]/30 pt-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[var(--theme-warning)] tracking-widest uppercase">
                  PONTOS DE ESTRUTURA (PE)
                </span>
                <Input
                  type="number"
                  min="1"
                  value={formData.armorProps.maxPe}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      armorProps: {
                        ...prev.armorProps,
                        maxPe: parseInt(e.target.value) || 1,
                        pe: parseInt(e.target.value) || 1,
                      },
                    }))
                  }
                  className="text-center font-mono border-[var(--theme-warning)]/50 text-[var(--theme-warning)]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[var(--theme-warning)] tracking-widest uppercase">
                  REDUÇÃO DE DANO (RD)
                </span>
                <Input
                  type="number"
                  min="1"
                  value={formData.armorProps.rd}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      armorProps: {
                        ...prev.armorProps,
                        rd: parseInt(e.target.value) || 1,
                      },
                    }))
                  }
                  className="text-center font-mono border-[var(--theme-warning)]/50 text-[var(--theme-warning)]"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {showSkillBind && (
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

      {isConsumable && (
        <div className="bg-[var(--theme-success)]/10 border border-[var(--theme-success)]/30 p-3 flex flex-col gap-3">
          <Checkbox
            label="INJETAR AÇÕES INSTANTÂNEAS"
            checked={formData.hasInstantActions}
            onChange={() =>
              setFormData((prev) => ({
                ...prev,
                hasInstantActions: !prev.hasInstantActions,
              }))
            }
          />
        </div>
      )}

      {formData.hasInstantActions && (
        <div className="border-t border-dashed border-[var(--theme-success)]/30 pt-3 flex flex-col gap-2">
          <span className="text-[10px] text-[var(--theme-success)] font-mono italic">
            * A injeção de múltiplas ações será feita em um modal dedicado na
            próxima etapa.
          </span>
        </div>
      )}

      {allowEffects ? (
        <div className="border-l-2 border-[var(--theme-accent)] bg-[var(--theme-accent)]/10 p-2 text-[10px] text-[var(--theme-accent)] font-mono italic">
          * O Módulo de Injeção de Efeitos estará disponível na próxima etapa.
        </div>
      ) : (
        <div className="border-l-2 border-[var(--theme-border)] bg-[var(--theme-background)] p-2 text-[10px] text-[var(--theme-text)]/50 font-mono italic">
          * A classificação deste item não suporta Injeção de Efeitos.
        </div>
      )}
    </motion.div>
  );
}
