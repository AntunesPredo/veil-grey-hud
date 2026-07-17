import { useState, useEffect } from "react";
import { useVitalsStore } from "./useVitalsStore";
import { useCharacterStore } from "../character/store";
import { useCharacterStats } from "../../shared/hooks/useCharacterStats";
import { Modal } from "../../shared/ui/Overlays";
import { Button } from "../../shared/ui/Form";
import { executeRawRoll } from "../../shared/utils/diceEngine";
import { RetroToast } from "../../shared/ui/RetroToast";
import { dispatchDiscordLog, type DiscordEmbed } from "../../shared/utils/discordWebhook";
import { VG_CONFIG } from "../../shared/config/system.config";
import { useNetworkStore } from "../../shared/store/useNetworkStore";
import { motion, AnimatePresence } from "framer-motion";

type RestStep = "INITIAL" | "WAITING" | "CONFIG" | "RESULT";

export function FullRestModal() {
  const { isFullRestOpen, closeFullRest, fullRestMasterConfig, setFullRestMasterConfig } = useVitalsStore();
  const name = useCharacterStore((state) => state.name);
  const sustenance = useCharacterStore((state) => state.sustenance);
  const updateSustenance = useCharacterStore((state) => state.updateSustenance);
  const updateEnergy = useCharacterStore((state) => state.updateEnergy);
  const applyDamage = useCharacterStore((state) => state.applyDamage);
  const sendPayload = useNetworkStore((state) => state.sendPayload);

  const { actualEnergy, slotsPerStage, maxEnergy, sustanceStages } = useCharacterStats();

  const [step, setStep] = useState<RestStep>("INITIAL");

  const [resultData, setResultData] = useState<{
    roll: number;
    success: boolean;
    sustenanceLoss: number;
    damageTaken: number;
    newEnergy: number;
  } | null>(null);

  const thresholdStarving = sustanceStages[0] - 1;
  const thresholdHungry = thresholdStarving + sustanceStages[1];
  const thresholdSatiated = thresholdHungry + sustanceStages[2];
  const isWellFed = sustenance.current >= thresholdSatiated;

  useEffect(() => {
    if (isFullRestOpen) {
      if (fullRestMasterConfig) {
        setStep("CONFIG");
      } else {
        setStep("INITIAL");
      }
    } else {
      setStep("INITIAL");
      setResultData(null);
      setFullRestMasterConfig(null);
    }
  }, [isFullRestOpen, fullRestMasterConfig, isWellFed, setFullRestMasterConfig]);

  if (!isFullRestOpen) return null;

  const handleRequestRest = () => {
    sendPayload("MESTRE", "REST_REQUEST", {});
    setStep("WAITING");
    RetroToast.info("SOLICITAÇÃO DE DESCANSO ENVIADA AO MESTRE.");
  };

  const handleRollRest = () => {
    if (!fullRestMasterConfig) return;

    // Modifier calculation
    const foodMod = isWellFed ? 2 : 0; // Well fed applies +2, otherwise 0
    const tempMod = fullRestMasterConfig.temperature;
    const comfortMod = fullRestMasterConfig.comfort;

    const mod = foodMod + tempMod + comfortMod;
    const roll = executeRawRoll(`${VG_CONFIG.rules.mainDice}+${mod}`);

    if (roll.error) return RetroToast.error(roll.error);

    const success = roll.total >= fullRestMasterConfig.difficulty || roll.isCriticalSuccess;

    let newSustenance = 0;
    let hpDamage = 0;
    let sustenanceLoss = 0;

    if (sustenance.current > thresholdSatiated) {
      newSustenance = thresholdHungry + 1;
    } else if (sustenance.current > thresholdHungry) {
      newSustenance = thresholdStarving + 1;
    } else if (sustenance.current > thresholdStarving) {
      newSustenance = 0;
    } else {
      newSustenance = 0;
      hpDamage = (sustenance.current + 1) * VG_CONFIG.rules.starvationHpDamagePerPoint;
    }

    sustenanceLoss = sustenance.current - newSustenance;

    let newEnergy = actualEnergy;
    if (success) {
      let currentLevelMax = maxEnergy;
      if (actualEnergy <= slotsPerStage) currentLevelMax = slotsPerStage;
      else if (actualEnergy <= slotsPerStage * 2) currentLevelMax = slotsPerStage * 2;

      newEnergy = Math.min(maxEnergy, currentLevelMax + slotsPerStage);

      let newCap = maxEnergy;
      if (newSustenance <= thresholdStarving) newCap = slotsPerStage;
      else if (newSustenance <= thresholdHungry) newCap = slotsPerStage * 2;

      newEnergy = Math.min(newEnergy, newCap);
    }

    setResultData({
      roll: roll.total,
      success,
      sustenanceLoss,
      damageTaken: hpDamage,
      newEnergy,
    });

    setStep("RESULT");

    const damageMsg = hpDamage > 0 ? `\n**[!] FALHA POR INANIÇÃO:** Dano Estrutural de ${hpDamage} PV aplicado.` : "";
    const resultText = success ? `SUCESSO (Energia -> ${newEnergy}/${maxEnergy})` : `FALHA (Energia Mantida: ${newEnergy}/${maxEnergy})`;

    const embed: DiscordEmbed = {
      title: "[~] CICLO DE DESCANSO LONGO [~]",
      color: success ? 3066993 : 15158332,
      description: `**UNIDADE OPERACIONAL:** ${name}\n**DIFICULDADE ALVO:** DC ${fullRestMasterConfig.difficulty}\n**MODIFICADORES:** Temperatura(${tempMod > 0 ? "+" + tempMod : tempMod}), Conforto(${comfortMod > 0 ? "+" + comfortMod : comfortMod}), Nutrição(${foodMod > 0 ? "+" + foodMod : foodMod})\n**ROLAGEM:** ${roll.total}\n**RESULTADO:** ${resultText}\n**ALIMENTAÇÃO DRENADA:** ${sustenanceLoss} pts.${damageMsg}`,
      footer: { text: "SYS.MNLT // BIO_TRACKER" },
      timestamp: new Date().toISOString(),
    };

    dispatchDiscordLog("PLAYER", name, "", [embed]);
  };

  const handleFinish = () => {
    if (resultData) {
      updateSustenance(sustenance.current - resultData.sustenanceLoss);
      if (resultData.damageTaken > 0) applyDamage(resultData.damageTaken, "IGNORE", null);
      updateEnergy(resultData.newEnergy);
    }
    closeFullRest();
  };

  // Temperature and Comfort labels for display
  const tempLabels: Record<number, string> = {
    [-3]: "MUITO FRIO", [-2]: "FRIO DESCONFORTÁVEL", [-1]: "FRIO",
    0: "TEMP. IRREGULAR", 1: "TEMP. ESTÁVEL", 2: "TEMP. CONFORTÁVEL", 3: "TEMP. IDEAL"
  };
  const comfortLabels: Record<number, string> = {
    [-3]: "CHÃO PURO", [-2]: "TAPETE", [-1]: "COLCHÃO DURO",
    0: "CAMA DE CAMPANHA", 1: "COBERTA E TRAVESSEIRO", 2: "CAMA CONFORTÁVEL", 3: "LENÇÓIS DE SEDA"
  };

  const isClosable = step !== "WAITING";

  return (
    <Modal
      isOpen={isFullRestOpen}
      onClose={isClosable ? closeFullRest : () => { }}
      title="PROTOCOLO: DESCANSO LONGO"
      hideCloseButton={!isClosable}
    >
      <div className="flex flex-col gap-4 min-h-[300px]">
        <AnimatePresence mode="wait">
          {step === "INITIAL" && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center flex-1 gap-6"
            >
              <div className="bg-[var(--theme-accent)]/5 border border-[var(--theme-accent)] p-4 text-center">
                <span className="text-xs font-bold tracking-widest uppercase text-[var(--theme-accent)] block mb-2">
                  ESTABELECER CONEXÃO
                </span>
                <p className="text-[10px] font-mono text-[var(--theme-text)]/70 uppercase">
                  Solicite a avaliação do ambiente ao Mestre.
                  As condições do local influenciarão diretamente na recuperação do sistema.
                </p>
              </div>
              <Button className="w-full py-4 text-lg animate-pulse shadow-[0_0_15px_var(--theme-accent)]" onClick={handleRequestRest} variant="primary">
                SOLICITAR AO MESTRE
              </Button>
            </motion.div>
          )}

          {step === "WAITING" && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center flex-1 gap-8 py-8"
            >
              <div className="relative flex items-center justify-center w-24 h-24">
                <div className="absolute inset-0 border-2 border-t-[var(--theme-accent)] border-r-[var(--theme-accent)] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-2 border-b-[var(--theme-warning)] border-l-[var(--theme-warning)] border-t-transparent border-r-transparent rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
                <div className="w-8 h-8 bg-[var(--theme-accent)] rotate-45 shadow-[0_0_20px_var(--theme-accent)] animate-pulse"></div>
              </div>
              <div className="text-center">
                <span className="text-sm font-bold tracking-widest text-[var(--theme-accent)] uppercase block mb-1">
                  AGUARDANDO MESTRE
                </span>
                <span className="text-[10px] font-mono text-[var(--theme-text)]/50 uppercase">
                  Análise ambiental em andamento...
                </span>
              </div>
            </motion.div>
          )}

          {step === "CONFIG" && fullRestMasterConfig && (
            <motion.div
              key="config"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="flex flex-col flex-1 gap-4"
            >
              <div className="bg-[var(--theme-accent)]/5 border border-[var(--theme-accent)] p-3 text-center">
                <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--theme-accent)] block mb-1">
                  CONDIÇÕES AVALIADAS
                </span>
              </div>

              <div className="flex flex-col gap-3 p-4 bg-[var(--theme-background)] border border-[var(--theme-border)]">
                <div className="flex justify-between items-center border-b border-[var(--theme-border)] pb-2">
                  <span className="text-[10px] font-bold text-[var(--theme-text)]/70 tracking-widest uppercase">TEMPERATURA</span>
                  <span className="text-xs font-mono font-black text-[var(--theme-accent)]">{tempLabels[fullRestMasterConfig.temperature] || fullRestMasterConfig.temperature} ({fullRestMasterConfig.temperature > 0 ? "+" + fullRestMasterConfig.temperature : fullRestMasterConfig.temperature})</span>
                </div>
                <div className="flex justify-between items-center border-b border-[var(--theme-border)] pb-2">
                  <span className="text-[10px] font-bold text-[var(--theme-text)]/70 tracking-widest uppercase">CONFORTO / ABRIGO</span>
                  <span className="text-xs font-mono font-black text-[var(--theme-accent)]">{comfortLabels[fullRestMasterConfig.comfort] || fullRestMasterConfig.comfort} ({fullRestMasterConfig.comfort > 0 ? "+" + fullRestMasterConfig.comfort : fullRestMasterConfig.comfort})</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-[10px] font-bold text-[var(--theme-text)]/70 tracking-widest uppercase">DIFICULDADE (DC)</span>
                  <span className="text-sm font-mono font-black text-[var(--theme-warning)] drop-shadow-[0_0_5px_var(--theme-warning)]">{fullRestMasterConfig.difficulty}</span>
                </div>
              </div>

              {isWellFed && (
                <div className="p-3 bg-[var(--theme-background)] border border-[var(--theme-success)]/50 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-[var(--theme-success)] rotate-45 shadow-[0_0_8px_var(--theme-success)]" />
                    <span className="text-[11px] font-bold tracking-widest uppercase text-[var(--theme-success)]">
                      BEM ALIMENTADO (+2)
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-[var(--theme-success)]/70 italic">
                    Nível nutricional ótimo. Bônus de regeneração ativo.
                  </span>
                </div>
              )}

              <div className="flex flex-col text-[9px] font-mono text-[var(--theme-danger)] italic border-t border-[var(--theme-border)] border-dashed pt-2 mt-auto">
                * O descanso longo reduzirá seu limiar de fome em um estágio, podendo causar inanição.
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <Button className="flex-1 border-dashed" onClick={closeFullRest} variant="danger">
                  CANCELAR
                </Button>
                <Button className="flex-1 shadow-[0_0_10px_var(--theme-accent)]" onClick={handleRollRest} variant="primary">
                  EXECUTAR CICLO
                </Button>
              </div>
            </motion.div>
          )}

          {step === "RESULT" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col flex-1 gap-4"
            >
              <div className={`border p-4 text-center relative overflow-hidden ${resultData?.success ? "bg-[var(--theme-success)]/10 border-[var(--theme-success)]" : "bg-[var(--theme-danger)]/10 border-[var(--theme-danger)]"}`}>
                <div className={`absolute -right-4 -top-4 w-16 h-16 rotate-45 opacity-20 ${resultData?.success ? "bg-[var(--theme-success)]" : "bg-[var(--theme-danger)]"}`}></div>
                <div className={`absolute -left-4 -bottom-4 w-16 h-16 rotate-45 opacity-20 ${resultData?.success ? "bg-[var(--theme-success)]" : "bg-[var(--theme-danger)]"}`}></div>

                <span className="text-[10px] font-bold tracking-widest uppercase block mb-1">
                  RESULTADO DO REPOUSO
                </span>
                <span className={`text-5xl font-mono font-black ${resultData?.success ? "text-[var(--theme-success)] glow-success drop-shadow-[0_0_15px_var(--theme-success)]" : "text-[var(--theme-danger)] glow-danger drop-shadow-[0_0_15px_var(--theme-danger)]"}`}>
                  {resultData?.roll}
                </span>
                <span className={`text-[11px] uppercase tracking-widest font-bold block mt-2 ${resultData?.success ? "text-[var(--theme-success)]" : "text-[var(--theme-danger)]"}`}>
                  {resultData?.success ? "[ SUCESSO NO REPARO ]" : "[ DESCANSO PERTURBADO ]"}
                </span>
              </div>

              <div className="flex flex-col gap-2 p-3 bg-black border border-[var(--theme-border)]">
                <div className="flex justify-between items-center text-[10px] font-mono font-bold text-[var(--theme-accent)] uppercase">
                  <span>ENERGIA ATUALIZADA:</span>
                  <span>{resultData?.newEnergy} / {maxEnergy}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono font-bold text-[var(--theme-warning)] uppercase">
                  <span>METABOLISMO DRENADO:</span>
                  <span>-{resultData?.sustenanceLoss} PTS</span>
                </div>
                {resultData?.damageTaken ? (
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold text-[var(--theme-danger)] uppercase animate-pulse">
                    <span>DANO POR INANIÇÃO:</span>
                    <span>-{resultData?.damageTaken} PV</span>
                  </div>
                ) : null}
              </div>

              <Button className="w-full mt-auto py-4" onClick={handleFinish} variant="primary">
                CONCLUIR E ACORDAR
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}

