import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useVitalsStore } from "./useVitalsStore";
import { useCharacterStore } from "../character/store";
import { Modal } from "../../shared/ui/Overlays";
import { Button, Input } from "../../shared/ui/Form";
import { executeRawRoll } from "../../shared/utils/diceEngine";
import { RetroToast } from "../../shared/ui/RetroToast";
import { dispatchDiscordLog } from "../../shared/utils/discordWebhook";
import type { EquipableItem } from "../../shared/types/veil-grey";
import { useCharacterStats } from "../../shared/hooks/useCharacterStats";

export function VitalsResolutionModal() {
  const isOpen = useVitalsStore((state) => state.isOpen);
  const mode = useVitalsStore((state) => state.mode);
  const inputValue = useVitalsStore((state) => state.inputValue);
  const setInputValue = useVitalsStore((state) => state.setInputValue);
  const closeModal = useVitalsStore((state) => state.closeModal);
  const name = useCharacterStore((state) => state.name);
  const inventory = useCharacterStore((state) => state.inventory);
  const applyDamage = useCharacterStore((state) => state.applyDamage);
  const applyHealing = useCharacterStore((state) => state.applyHealing);

  const { maxHp } = useCharacterStats();

  const [step, setStep] = useState<"INPUT" | "MITIGATION">("INPUT");
  const [rolledAmount, setRolledAmount] = useState(0);

  const equippedArmor = useMemo(
    () =>
      inventory.find(
        (i) =>
          i.isEquipped &&
          "armorProps" in i &&
          !!(i as EquipableItem).armorProps,
      ) as EquipableItem | undefined,
    [inventory],
  );

  if (!isOpen) return null;

  const handleProcessInput = () => {
    const result = executeRawRoll(inputValue || "0");
    if (result.error) return RetroToast.error(result.error);

    const total = result.total;
    setRolledAmount(total);

    if (mode === "DAMAGE") {
      if (equippedArmor) {
        dispatchDiscordLog(
          "PLAYER",
          name,
          `Dano total recebido: ${total}. Aguardando reduções.`,
        );
        setStep("MITIGATION");
      } else {
        executeFinalTransaction("IGNORE", total);
      }
    } else {
      executeFinalTransaction("IGNORE", total);
    }
  };

  const executeFinalTransaction = (
    mitigation: "FULL" | "HALF" | "IGNORE",
    overrideAmount?: number,
  ) => {
    const finalAmount =
      overrideAmount !== undefined ? overrideAmount : rolledAmount;

    if (mode === "HEALING") {
      applyHealing(finalAmount, maxHp);
      dispatchDiscordLog(
        "PLAYER",
        name,
        `RECUPERAÇÃO VITAL: +${finalAmount} PV.`,
      );
      RetroToast.success(`SINAL VITAL RESTAURADO: +${finalAmount}`);
    } else {
      let rdValue = 0;
      if (mitigation !== "IGNORE" && equippedArmor?.armorProps) {
        rdValue = equippedArmor.armorProps.rd;
        if (mitigation === "HALF") rdValue = Math.floor(rdValue / 2);
        rdValue = Math.min(finalAmount, rdValue, equippedArmor.armorProps.pe);
      }

      const damageToHp = Math.max(0, finalAmount - rdValue);

      const logMsg = `Dano total recebido: ${finalAmount}, redução utilizada: ${mitigation} [${rdValue}], Dano na vida: ${damageToHp}.`;

      applyDamage(finalAmount, mitigation, equippedArmor?.id || null, maxHp);
      dispatchDiscordLog("PLAYER", name, logMsg);
      RetroToast.error(`TRAUMA PROCESSADO: -${damageToHp}`);
    }
    handleClose();
  };

  const handleClose = () => {
    setStep("INPUT");
    closeModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        mode === "HEALING" ? "PROTOCOLO DE RECUPERAÇÃO" : "REGISTRO DE TRAUMA"
      }
    >
      <div className="flex flex-col gap-4">
        {step === "INPUT" ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[var(--theme-accent)] tracking-widest uppercase">
                VALOR OU EXPRESSÃO (EX: 2D6+4)
              </span>
              <Input
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleProcessInput()}
                className="text-center text-xl font-bold py-3"
              />
            </div>
            <Button
              variant={mode === "HEALING" ? "success" : "danger"}
              onClick={handleProcessInput}
              className="py-3"
            >
              EXECUTAR ANÁLISE
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="bg-[var(--theme-background)] border border-[var(--theme-warning)] p-3 text-center">
              <span className="text-[10px] font-bold text-[var(--theme-warning)] block mb-1">
                DANO DETECTADO
              </span>
              <span className="text-3xl font-mono font-bold text-[var(--theme-accent)]">
                {rolledAmount}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-[var(--theme-accent)] text-center uppercase tracking-widest">
                SELECIONAR RESPOSTA BALÍSTICA
              </span>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  onClick={() => executeFinalTransaction("FULL")}
                  className="border-dashed text-[10px] py-3"
                >
                  UTILIZAR ARMADURA TOTAL (RD {equippedArmor?.armorProps?.rd})
                </Button>
                <Button
                  onClick={() => executeFinalTransaction("HALF")}
                  className="border-dashed text-[10px] py-3"
                >
                  MITIGAÇÃO PARCIAL (METADE RD)
                </Button>
                <Button
                  variant="danger"
                  onClick={() => executeFinalTransaction("IGNORE")}
                  className="border-dashed text-[10px] py-3"
                >
                  IGNORAR ARMADURA (DANO DIRETO)
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </Modal>
  );
}
