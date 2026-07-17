import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCombatStatus } from "./useCombatStatus";
import { useCharacterStats } from "../../shared/hooks/useCharacterStats";
import { useCharacterStore } from "../../features/character/store";
import { Button } from "../../shared/ui/Form";
import { useNetworkStore } from "../../shared/store/useNetworkStore";
import { FiChevronDown, FiChevronUp } from "../../shared/ui/Icons";

export function CombatDrawer() {
  const combatStatus = useCombatStatus();
  const { actionPoints, reactions, movement, maxHp, maxEnergy, energyState, actualEnergy } = useCharacterStats();
  const hp = useCharacterStore(state => state.hp);
  const energy = useCharacterStore(state => state.energy);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (combatStatus.inCombat && combatStatus.myTurn) {
      setIsOpen(true);
    }
  }, [combatStatus.inCombat, combatStatus.myTurn]);

  if (!combatStatus.inCombat) return null;

  const handleNextTurn = () => {
    useNetworkStore.getState().sendPayload("MESTRE", "EVENT_ACTION", {
      action: "NEXT_TURN",
      eventId: combatStatus.combatEvent?.id
    });
    setIsOpen(false);
  };

  const currentAp = Math.max(0, actionPoints - (combatStatus.participant?.apUsed || 0));
  const currentRx = Math.max(0, reactions - (combatStatus.participant?.reactionUsed || 0));

  const hpPerc = Math.max(0, Math.min(100, (hp.current / maxHp) * 100)) || 0;
  const hpColor = hpPerc > 50 ? "bg-[var(--theme-success)]" : hpPerc > 25 ? "bg-[var(--theme-warning)]" : "bg-[var(--theme-danger)]";

  const energyPerc = Math.max(0, Math.min(100, (actualEnergy / maxEnergy) * 100)) || 0;
  const energyColor = energyState === "RESTED" ? "bg-[var(--theme-accent)]" : energyState === "TIRED" ? "bg-[var(--theme-warning)]" : "bg-[var(--theme-danger)]";

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center z-[150] pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-center w-full max-w-3xl px-2">
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-black border-2 border-b-0 border-[var(--theme-text)] text-[var(--theme-text)] px-8 py-1 rounded-t-lg hover:bg-[var(--theme-text)] hover:text-black transition-colors flex items-center gap-2 uppercase font-bold text-xs font-mono shadow-[0_-5px_15px_rgba(var(--theme-text-rgb),0.2)]"
        >
          <span>COMBATE ATIVO</span>
          {isOpen ? <FiChevronDown /> : <FiChevronUp />}
        </button>

        {/* Drawer Body */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="bg-black border-2 border-[var(--theme-text)] w-full flex flex-col overflow-hidden shadow-[0_0_30px_rgba(var(--theme-text-rgb),0.2)]"
            >
              <div className="p-4 flex flex-col gap-4">

                {/* Barras de Vida e Energia */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-12 font-bold tracking-widest text-[var(--theme-danger)]">VIDA</span>
                    <div className="flex-1 bg-black border border-[var(--theme-danger)]/50 h-3 relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${hpPerc}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full ${hpColor}`}
                      />
                    </div>
                    <span className="text-[10px] w-12 text-right font-mono font-bold">{hp.current}/{maxHp}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-12 font-bold tracking-widest text-[var(--theme-accent)]">ENG</span>
                    <div className="flex-1 bg-black border border-[var(--theme-accent)]/50 h-3 relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${energyPerc}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full ${energyColor}`}
                      />
                    </div>
                    <span className="text-[10px] w-12 text-right font-mono font-bold">{energy.current}/{maxEnergy}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center mt-2">
                  <div className="flex flex-col items-center bg-black border border-[var(--theme-text)]/30 p-2">
                    <span className="text-[10px] text-[var(--theme-text)]/70 font-bold tracking-widest uppercase">Ações</span>
                    <span className="text-2xl font-mono text-[var(--theme-text)] font-bold">{currentAp}<span className="text-xs text-[var(--theme-text)]/50">/{actionPoints}</span></span>
                  </div>
                  <div className="flex flex-col items-center bg-black border border-[var(--theme-warning)]/30 p-2">
                    <span className="text-[10px] text-[var(--theme-warning)]/70 font-bold tracking-widest uppercase">Reações</span>
                    <span className="text-2xl font-mono text-[var(--theme-warning)] font-bold">{currentRx}<span className="text-xs text-[var(--theme-warning)]/50">/{reactions}</span></span>
                  </div>
                  <div className="flex flex-col items-center bg-black border border-[var(--theme-success)]/30 p-2">
                    <span className="text-[10px] text-[var(--theme-success)]/70 font-bold tracking-widest uppercase">Mover</span>
                    <span className="text-2xl font-mono text-[var(--theme-success)] font-bold">{movement}<span className="text-xs text-[var(--theme-success)]/50">m</span></span>
                  </div>
                </div>

                <Button
                  variant={combatStatus.myTurn ? "primary" : "primary"}
                  disabled={!combatStatus.myTurn}
                  onClick={handleNextTurn}
                  className={`w-full py-4 text-xl tracking-widest font-bold border-2 ${combatStatus.myTurn ? "border-[var(--theme-text)] bg-[var(--theme-text)]/10 shadow-[inset_0_0_15px_rgba(var(--theme-text-rgb),0.5)] glow-text text-[var(--theme-text)]" : "border-dashed opacity-50"}`}
                >
                  {combatStatus.myTurn ? "FINALIZAR TURNO" : "AGUARDE SEU TURNO"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
