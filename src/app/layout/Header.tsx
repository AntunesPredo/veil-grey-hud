import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VG_CONFIG } from "../../shared/config/system.config";
import { Button, Input } from "../../shared/ui/Form";
import {
  executeRawRoll,
  type ParseResult,
} from "../../shared/utils/diceEngine";
import { RetroToast } from "../../shared/ui/RetroToast";
import { useDisclosure } from "../../shared/hooks/useDisclosure";
import { ConfirmModal, Modal } from "../../shared/ui/Overlays";
import { GlitchImage } from "../../shared/ui/GlitchImage";
import { SettingsModal } from "../../features/progression/SettingsModal";
import { useCharacterStore } from "../../features/character/store";

export function Header() {
  const {
    name,
    role,
    level,
    xp,
    creationStatus,
    freePoints,
    triggerLevelUp,
    confirmDistribution,
  } = useCharacterStore();

  const settingsModal = useDisclosure();
  const confirmModal = useDisclosure();

  const isDistributing =
    creationStatus === "STARTED" || creationStatus === "LEVEL_UP";
  const hasFreePoints = freePoints.attributes > 0 || freePoints.skills > 0;
  const canLevelUp = xp.current >= xp.max;

  const currentTier =
    VG_CONFIG.progression.tiers
      .slice()
      .reverse()
      .find((t) => level >= t.minLevel) || VG_CONFIG.progression.tiers[0];

  const handleConfirmDistribution = () => confirmModal.onOpen();

  return (
    <header className="bg-[var(--theme-background)] border-b border-[var(--theme-accent)] p-3 md:p-4 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 relative z-50">
      <div className="flex flex-col md:flex-row items-center w-full md:w-auto flex-1">
        <GlitchImage
          src={
            new URL(
              "../../assets/images/logos/protetorate.svg",
              import.meta.url,
            ).href
          }
          alt="Protetorado - Logo"
          containerClassName="w-12 h-12 md:w-14 md:h-14 mb-1 md:mb-0 shrink-0 bg-transparent border-none"
          className="object-contain"
          glitchIntensity="low"
          noLoad
        />

        <div className="flex ml-1 flex-col items-center md:items-start text-center md:text-left">
          <span
            className={`ml-0 md:ml-2 text-[8px] px-1.5 py-0.5 border font-bold uppercase tracking-widest ${
              isDistributing
                ? "border-[var(--theme-warning)] text-[var(--theme-warning)] bg-[var(--theme-warning)]/10 animate-pulse"
                : "border-[var(--theme-success)] text-[var(--theme-success)] bg-[var(--theme-success)]/10"
            }`}
          >
            SYS: {creationStatus}
          </span>

          <h1
            className="px-2 text-xl md:text-2xl font-bold tracking-[0.1em] text-[var(--theme-accent)] glow-text uppercase max-w-[200px] md:max-w-[300px] truncate"
            title={name || "UNKNOWN"}
          >
            {name || "UNKNOWN"}
          </h1>

          <span className="pl-0 md:pl-2 text-[10px] text-gray-400 tracking-widest font-mono mt-0.5">
            FUNÇÃO:{" "}
            <span className="text-[var(--theme-text)]">
              {role?.title || "NÃO ATRIBUÍDA"}
            </span>
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center w-full md:w-auto flex-1 max-w-md px-2">
        <div className="flex justify-between items-end w-full text-[11px] font-bold text-[var(--theme-accent)] mb-1.5">
          <span className="tracking-widest">NÍVEL {level}</span>
          <span className="text-[var(--theme-text)]/40 text-[9px] tracking-widest">
            MAX: ATT {currentTier.maxAttr} | SKL {currentTier.maxSkill}
          </span>
          <span className="tracking-widest">
            {xp.current} / {xp.max} XP
          </span>
        </div>

        <div className="w-full h-1.5 bg-[var(--theme-background)] border border-[var(--theme-border)] relative overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.5)_inset]">
          <motion.div
            className="h-full bg-[var(--theme-accent)] shadow-[0_0_8px_var(--theme-accent)]"
            initial={{ width: 0 }}
            animate={{
              width: `${Math.min((xp.current / xp.max) * 100, 100)}%`,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        <AnimatePresence>
          {canLevelUp && !isDistributing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full"
            >
              <Button
                size="sm"
                variant="success"
                className="mt-3 w-full text-[10px] animate-pulse border-dashed"
                onClick={triggerLevelUp}
              >
                [↑] INICIAR EVOLUÇÃO [↑]
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full md:w-auto flex flex-col items-stretch md:flex-row items-center justify-end gap-3 flex-1 mt-2 md:mt-0">
        <AnimatePresence mode="wait">
          {isDistributing ? (
            <motion.div
              key="distribution"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-between md:justify-end gap-4 bg-[var(--theme-accent)]/5 border border-[var(--theme-accent)]/30 p-1 px-2 w-full md:w-auto"
            >
              <div className="flex flex-col text-center ">
                <span className="text-[11px] text-[var(--theme-accent)] font-bold tracking-widest">
                  PONTOS LIVRES
                </span>
                <div className="flex gap-2">
                  <span className="text-xs font-mono font-bold text-[var(--theme-text)]">
                    ATT:{" "}
                    <span className="text-[var(--theme-warning)]">
                      {freePoints.attributes}
                    </span>
                  </span>
                  <span className="text-xs font-mono font-bold text-[var(--theme-accent)]">
                    |
                  </span>
                  <span className="text-xs font-mono font-bold text-[var(--theme-text)]">
                    SKL:{" "}
                    <span className="text-[var(--theme-warning)]">
                      {freePoints.skills}
                    </span>
                  </span>
                </div>
              </div>
              <Button
                onClick={handleConfirmDistribution}
                size="sm"
                className={
                  hasFreePoints
                    ? "border-[var(--theme-warning)] bg-[var(--theme-warning)]/10 text-[var(--theme-warning)] hover:bg-[var(--theme-warning)]"
                    : "border-[var(--theme-success)] bg-[var(--theme-success)]/10 text-[var(--theme-success)] hover:bg-[var(--theme-success)]"
                }
              >
                {hasFreePoints ? "GUARDAR PONTOS" : "FINALIZAR"}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="diceroller"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full md:w-auto"
            >
              <RawDiceRoller />
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          size="sm"
          onClick={settingsModal.onOpen}
          className="w-full md:w-10 flex items-center justify-center p-0 shrink-0 border-[var(--theme-border)] hover:border-[var(--theme-accent)] bg-[var(--theme-background)]"
          title="Configurações"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
          </svg>
          <span className="md:hidden ml-2 text-[10px] font-bold tracking-widest">
            CONFIGURAÇÕES
          </span>
        </Button>
      </div>

      <SettingsModal
        isOpen={settingsModal.isOpen}
        onClose={settingsModal.onClose}
      />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.onClose}
        onConfirm={confirmDistribution}
        title={hasFreePoints ? "PONTOS NÃO ALOCADOS" : "FINALIZAR EVOLUÇÃO?"}
        message={
          hasFreePoints
            ? "Existem pontos livres não distribuídos. Eles serão acumulados e poderão ser gastos no próximo Nível. Deseja prosseguir e concluir a evolução?"
            : "Você gastou todos os pontos disponíveis. Deseja confirmar as alocações e travar os pontos?"
        }
      />
    </header>
  );
}

function RawDiceRoller() {
  const [expression, setExpression] = useState("");
  const { settings } = useCharacterStore();

  const detailModal = useDisclosure();
  const [lastResult, setLastResult] = useState<ParseResult | null>(null);

  const handleRoll = () => {
    if (!expression.trim()) return;
    const result = executeRawRoll(expression);

    if (result.error) {
      RetroToast.error(result.error);
    } else {
      if (settings.showRollDetails) {
        setLastResult(result);
        detailModal.onOpen();
      } else {
        RetroToast.info(`[${expression.toUpperCase()}] = ${result.total}`);
      }
    }
    setExpression("");
  };

  return (
    <>
      <div className="flex bg-[var(--theme-accent)]/10 border border-[var(--theme-border)] p-1 w-full md:w-auto items-center group focus-within:border-[var(--theme-accent)] transition-colors">
        <span className="text-[var(--theme-accent)] font-mono text-xs pl-2 select-none group-focus-within:text-[var(--theme-accent)]">
          {">_"}
        </span>
        <Input
          placeholder="2d20+5"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRoll()}
          className="w-full md:w-28 text-left bg-transparent border-none text-xs px-2 shadow-none focus:bg-transparent uppercase"
        />
        <Button
          size="sm"
          onClick={handleRoll}
          className="border-none bg-[var(--theme-background)] hover:bg-[var(--theme-accent)] px-3 py-1"
        >
          EXEC
        </Button>
      </div>

      <Modal
        isOpen={detailModal.isOpen}
        onClose={detailModal.onClose}
        title="LOG DE PROCESSAMENTO"
      >
        <div className="flex flex-col gap-4">
          <div className="bg-[var(--theme-background)] border border-[var(--theme-border)] p-3 overflow-x-auto custom-scrollbar">
            <pre className="text-xs text-[var(--theme-text)] font-mono leading-relaxed whitespace-pre-wrap">
              {lastResult?.log || "NENHUM DADO PROCESSADO."}
            </pre>
          </div>
          <div className="flex justify-between items-center bg-[var(--theme-accent)]/10 border border-[var(--theme-accent)]/40 p-2">
            <span className="text-[10px] text-[var(--theme-accent)] font-bold tracking-widest">
              OUTPUT FINAL:
            </span>
            <span className="text-2xl font-bold text-[var(--theme-accent)] glow-text">
              {lastResult?.total}
            </span>
          </div>
          <Button
            variant="primary"
            onClick={detailModal.onClose}
            className="w-full"
          >
            ACEITAR
          </Button>
        </div>
      </Modal>
    </>
  );
}
