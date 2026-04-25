import { VG_CONFIG } from "../../shared/config/system.config";
import { useSystemData } from "../../shared/hooks/useSystemData";
import type { Attribute } from "../../shared/types/veil-grey";
import { Button, NumberStepper } from "../../shared/ui/Form";
import { GlitchImage } from "../../shared/ui/GlitchImage";
import { RetroToast } from "../../shared/ui/RetroToast";

type ShowRoleDetailsProps = {
  totalFreePoints: number;
  currentRoleData: (typeof VG_CONFIG.roles)[keyof typeof VG_CONFIG.roles];
  pointsRemaining: number;
  allocatedPoints: Record<string, number>;
  handleBackToList: () => void;
  handlePointAllocation: (skillId: string, amount: number) => void;
  handleConfirm: () => void;
};

export function ShowRoleDetails({
  totalFreePoints,
  currentRoleData,
  pointsRemaining,
  allocatedPoints,
  handlePointAllocation,
  handleBackToList,
  handleConfirm,
}: ShowRoleDetailsProps) {
  const handleConfirmClick = () => {
    if (pointsRemaining === 0) {
      handleConfirm();
    } else {
      RetroToast.warning(
        `PONTOS LIVRES PARA DISTRIBUIÇÃO: [${pointsRemaining}].`,
      );
    }
  };
  const { getAttributeById } = useSystemData();

  return (
    <>
      <div className="md:hidden p-2 border-b border-[var(--theme-border)] bg-[var(--theme-background)] shrink-0">
        <Button
          variant="danger"
          size="sm"
          className="w-full border-dashed"
          onClick={handleBackToList}
        >
          [ CANCELAR SELEÇÃO ]
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {currentRoleData.photoUrl && (
            <div className="w-full md:w-[40%] aspect-[3/4] shrink-0 border-2 border-[var(--theme-border)] relative group overflow-hidden bg-[var(--theme-background)]">
              <GlitchImage
                src={currentRoleData.photoUrl as string}
                alt={currentRoleData.title}
                containerClassName="w-full h-full border-none"
                className="object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-700"
                glitchIntensity="low"
              />
              <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-[var(--theme-background)] to-transparent">
                <span className="text-[9px] font-mono text-[var(--theme-accent)]">
                  ID: {btoa(currentRoleData.id.toUpperCase())}
                </span>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-4 flex-1">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--theme-accent)] tracking-widest uppercase glow-text leading-tight">
                {currentRoleData.title}
              </h1>
              <div className="h-[2px] w-16 bg-[var(--theme-accent)] mt-2 mb-4" />
              <p className="text-[var(--theme-accent)] text-sm md:text-base leading-relaxed text-justify">
                {currentRoleData.description}
              </p>
            </div>

            <div className="border border-[var(--theme-accent)]/30 bg-[var(--theme-accent)]/5 p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[var(--theme-accent)]" />
              <h3 className="text-[var(--theme-accent)] font-bold text-xs md:text-sm mb-2 uppercase flex items-center gap-2">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.22 1.75-.61 2.51l2.54 2.54c1.33-1.42 2.07-3.14 2.07-5.05 0-4.66-3.52-8.5-8-8.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-4.48.45-8 4.29-8 8.95 0 4.97 4.03 9 9 9 2.15 0 4.12-.76 5.68-2.03l-2.02-2.02C14.16 18.39 13.13 19 12 19z" />
                </svg>
                HABILIDADE ÚNICA: {currentRoleData.uniqueAbility.title}
              </h3>
              <p className="text-[var(--theme-accent)]/60 text-xs md:text-sm leading-relaxed">
                {currentRoleData.uniqueAbility.description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 mt-4 border-t border-dashed border-[var(--theme-border)] pt-6">
          <div>
            <h3 className="text-[var(--theme-accent)] font-bold tracking-widest text-sm md:text-base uppercase">
              ATRIBUTOS INICIAIS
            </h3>
          </div>
          <div className="flex w-full gap-3">
            {Object.entries(currentRoleData.initialStats.attributes).map(
              ([attrKey, value]) => (
                <div
                  key={attrKey}
                  className="flex flex-col items-center bg-[var(--theme-background)] border border-[var(--theme-accent)]/40 px-4 py-2 flex-1"
                >
                  <span className="text-sm text-[var(--theme-accent)] font-bold mb-1">
                    {getAttributeById(attrKey as Attribute)?.label || attrKey}
                  </span>
                  <span className="text-xl font-bold text-[var(--theme-accent)] glow-text">
                    {value as number}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-4 border-t border-dashed border-[var(--theme-border)] pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div>
              <h3 className="text-[var(--theme-accent)] font-bold tracking-widest text-sm md:text-base uppercase">
                PERÍCIAS BÁSICAS
              </h3>
              <p className="text-[12px] text-[var(--theme-text)]">
                Aperfeiçoe suas técnicas base.
              </p>
            </div>
            <div
              className={`flex items-center gap-2 px-3 py-1.5 border-2 transition-colors ${pointsRemaining === 0 ? "border-[var(--theme-success)] text-[var(--theme-success)] bg-[var(--theme-success)]/10" : "border-[var(--theme-warning)] text-[var(--theme-warning)] bg-[var(--theme-warning)]/10 animate-pulse"}`}
            >
              <span className="text-[12px] font-bold tracking-widest uppercase">
                PONTOS LIVRES:
              </span>
              <span className="text-lg font-bold">{pointsRemaining}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentRoleData.initialStats.baseSkills.map((skillKey: string) => {
              let skillData: {
                label: string;
                description: string;
              } = { label: "-", description: "-" };

              Object.values(VG_CONFIG.skill_groups).forEach((g) => {
                if (g.skills[skillKey as keyof typeof g.skills]) {
                  skillData = g.skills[skillKey as keyof typeof g.skills];
                }
              });

              const skillLabel = skillData.label || skillKey;
              const skillDesc =
                skillData.description ||
                "Descrição indisponível no banco de dados.";

              const baseVal =
                VG_CONFIG.rules.characterCreation.skillPointsGranted || 0;
              const addedVal = allocatedPoints[skillKey] || 0;
              const totalVal = baseVal + addedVal;

              return (
                <div
                  key={skillKey}
                  className="flex flex-col bg-[var(--theme-background)] border border-[var(--theme-border)] hover:border-[var(--theme-accent)]/40 transition-colors p-3 gap-3"
                >
                  <div className="flex flex-col justify-between items-start gap-2">
                    <div className="flex w-full items-center flex-row justify-between">
                      <span className="text-xl font-bold text-[var(--theme-accent)] uppercase tracking-wider">
                        {skillLabel}
                      </span>
                      <NumberStepper
                        size="md"
                        value={totalVal}
                        onDecrement={() => handlePointAllocation(skillKey, -1)}
                        onIncrement={() => handlePointAllocation(skillKey, 1)}
                        disableDecrement={addedVal === 0}
                        disableIncrement={pointsRemaining === 0}
                      />
                    </div>
                    <span className="text-[11px] text-[var(--theme-text)] line-clamp-7 mt-1">
                      {skillDesc}
                    </span>
                  </div>
                  <div className="flex gap-1 w-full h-1.5 mt-auto">
                    {Array.from(
                      { length: baseVal + totalFreePoints },
                      (_, i) => i + 1,
                    ).map((points) => (
                      <div
                        key={points}
                        className={`flex-1 h-full ${points <= baseVal ? "bg-[var(--theme-accent)]/40" : points <= totalVal ? "bg-[var(--theme-accent)] shadow-[0_0_5px_var(--theme-accent)]" : "bg-[var(--theme-background)]/40"}`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[var(--theme-border)] bg-[var(--theme-background)] shrink-0">
        <Button
          className={`w-full py-4 text-base transition-all duration-500 ${pointsRemaining === 0 ? "bg-[var(--theme-accent)] text-[var(--theme-background)] shadow-[0_0_20px_var(--theme-accent)] animate-none" : "opacity-40 grayscale border-dashed border-[var(--theme-border)] bg-transparent text-[var(--theme-text)]"}`}
          onClick={handleConfirmClick}
        >
          {pointsRemaining === 0
            ? "CONFIRMAR ARQUÉTIPO"
            : "REQUISITOS PENDENTES"}
        </Button>
      </div>
    </>
  );
}
