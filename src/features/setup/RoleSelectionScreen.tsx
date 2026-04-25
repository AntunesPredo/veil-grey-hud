import { useState, useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useCharacterStore } from "../character/store";
import { VG_CONFIG } from "../../shared/config/system.config";
import { Button } from "../../shared/ui/Form";
import { RetroToast } from "../../shared/ui/RetroToast";
import { ShowRoleDetails } from "./ShowRoleDetails";

const panelVariants: Variants = {
  hidden: { opacity: 0, x: 50, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: "easeOut" } as const,
  },
  exit: {
    opacity: 0,
    x: -50,
    filter: "blur(4px)",
    transition: { duration: 0.3, ease: "easeIn" } as const,
  },
};

export function RoleSelectionScreen() {
  const name = useCharacterStore((state) => state.name);
  const confirmRoleSelection = useCharacterStore(
    (state) => state.confirmRoleSelection,
  );
  const updateProgression = useCharacterStore(
    (state) => state.updateProgression,
  );

  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [allocatedPoints, setAllocatedPoints] = useState<
    Record<string, number>
  >({});

  const roles = Object.values(VG_CONFIG.roles);

  const totalFreePoints =
    VG_CONFIG.rules.characterCreation.skillPointsToDistribute || 0;

  const currentRoleData = useMemo(
    () =>
      selectedRole
        ? VG_CONFIG.roles[selectedRole as keyof typeof VG_CONFIG.roles]
        : null,
    [selectedRole],
  );

  const pointsUsed = Object.values(allocatedPoints).reduce((a, b) => a + b, 0);
  const pointsRemaining = totalFreePoints - pointsUsed;

  const handleSelectRole = (roleId: string) => {
    setSelectedRole(roleId);
    setAllocatedPoints({});
  };

  const handlePointAllocation = (skillId: string, amount: number) => {
    const currentVal = allocatedPoints[skillId] || 0;
    const newVal = currentVal + amount;

    if (newVal < 0) return;
    if (amount > 0 && pointsRemaining <= 0) return;

    setAllocatedPoints((prev) => ({ ...prev, [skillId]: newVal }));
  };

  const handleConfirm = () => {
    if (!selectedRole) return;
    confirmRoleSelection(
      selectedRole as keyof typeof VG_CONFIG.roles,
      allocatedPoints,
    );
    RetroToast.success("PERFIL ATUALIZADO. BEM-VINDO.");
  };

  const handleBackToWelcome = () => {
    updateProgression({ creationStatus: "NOT_STARTED" });
  };

  const handleBackToList = () => {
    setSelectedRole(null);
    setAllocatedPoints({});
  };

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto p-2 md:p-6">
      <div className="flex justify-between items-center bg-[var(--theme-background)]/90 border border-[var(--theme-border)] p-4 mb-4 shrink-0 shadow-[0_0_15px_rgba(0,0,0,0.8)]">
        <Button
          variant="primary"
          onClick={handleBackToWelcome}
          className="hidden md:block"
        >
          &lt; RETORNAR
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleBackToWelcome}
          className="md:hidden"
        >
          &lt;
        </Button>

        <div className="flex flex-col items-end text-right">
          <span className="text-[10px] text-[var(--theme-text)] tracking-widest uppercase">
            IDENTIFICADOR:
          </span>
          <h1 className="text-xl md:text-2xl font-bold tracking-[0.1em] text-[var(--theme-accent)] glow-text truncate max-w-[300px] md:max-w-md p-1 pl-2">
            {name}
          </h1>
        </div>
      </div>

      <div className="border-b border-[var(--theme-accent)]/30 pb-2 mb-2 shrink-0">
        <h2 className="text-[var(--theme-accent)] font-bold tracking-widest text-sm md:text-base">
          ARQUÉTIPOS DISPONÍVEIS
        </h2>
        <p className="text-[12px] text-[var(--theme-text)]">
          Selecione sua utilidade para o Protetorado.
        </p>
      </div>
      <div className="flex flex-1 overflow-hidden relative gap-6">
        <div
          className={`w-full md:w-1/3 flex-col gap-3 overflow-y-auto py-4 px-6 border-r border-[var(--theme-border)] border-dashed custom-scrollbar scroll-left  ${selectedRole ? "hidden md:flex" : "flex"}`}
        >
          {roles.map((role) => {
            const animate =
              selectedRole === role.id
                ? "bg-[var(--theme-accent)]/30 border-[var(--theme-accent)] shadow-[0_0_10px_var(--theme-accent)] scale-[1.02]"
                : "bg-[var(--theme-background)] border-[var(--theme-border)] hover:border-[var(--theme-accent)]/60 hover:bg-[var(--theme-accent)]/20";
            return (
              <button
                key={role.id}
                onClick={() => handleSelectRole(role.id)}
                className={`group flex flex-col text-left p-4 border transition-all duration-300 relative ${
                  animate
                }`}
              >
                <h3
                  className={`font-bold tracking-widest uppercase text-sm md:text-base  ${selectedRole === role.id ? "text-[var(--theme-accent)] glow-text" : "text-[var(--theme-accent)]/60"} hover:text-[var(--theme-accent)]`}
                >
                  {role.title}
                </h3>
                <span
                  className={`text-[10px] md:text-xs ${selectedRole === role.id ? "text-[var(--theme-text)] glow-text" : "text-[var(--theme-text)]/60"} mt-1 italic`}
                >
                  "{role.subtitle}"
                </span>
              </button>
            );
          })}
        </div>

        <div
          className={`flex-1 flex-col h-full relative overflow-hidden ${!selectedRole ? "hidden md:flex" : "flex absolute inset-0 z-20 bg-[var(--theme-background)] md:static md:bg-transparent"}`}
        >
          <AnimatePresence mode="wait">
            {!currentRoleData ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-center border border-[var(--theme-border)] bg-[var(--theme-background)]"
              >
                <div className="text-[var(--theme-border)] tracking-widest text-xs animate-pulse font-mono border border-[var(--theme-border)] p-4">
                  AGUARDANDO SELEÇÃO DE ARQUÉTIPO...
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={currentRoleData.id}
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex-1 flex flex-col bg-[ver(--theme-background)] border border-[var(--theme-border)] shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden"
              >
                <ShowRoleDetails
                  totalFreePoints={totalFreePoints}
                  currentRoleData={currentRoleData}
                  pointsRemaining={pointsRemaining}
                  allocatedPoints={allocatedPoints}
                  handleBackToList={handleBackToList}
                  handlePointAllocation={handlePointAllocation}
                  handleConfirm={handleConfirm}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
