import { HealthWidget } from "./HealthWidget";
import { SystemModifiersWidget } from "./SystemModifiersWidget";

export function VitalsPanel() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="border border-[var(--theme-accent)]/30 bg-[var(--theme-background)]/40 flex flex-col h-full">
          <div className="bg-[var(--theme-accent)]/10 border-b border-[var(--theme-accent)]/30 p-2 font-bold tracking-widest uppercase">
            SISTEMA DE SUPORTE À VIDA
          </div>
          <div className="p-4 flex flex-col gap-4 flex-1">
            <HealthWidget />
            <div className="border-t border-dashed border-[var(--theme-accent)]/30 pt-4 grid grid-cols-2 gap-4 flex-1">
              <div className="flex flex-col justify-center">
                {/* <SustenanceWidget /> */}
              </div>
              <div className="border-l border-dashed border-[var(--theme-accent)]/30 pl-4">
                {/* <EnergyWidget /> */}
              </div>
            </div>
          </div>
        </div>

        <div className="border border-[var(--theme-accent)]/30 bg-[var(--theme-background)]/40 flex flex-col h-full">
          <div className="bg-[var(--theme-accent)]/10 border-b border-[var(--theme-accent)]/30 p-2 font-bold tracking-widest uppercase">
            PSIQUE & CONDUTA
          </div>
          <div className="p-4 flex flex-col gap-4 flex-1">
            {/* <InsanityWidget /> */}
            <div className="border-t border-dashed border-[var(--theme-accent)]/30 pt-4 flex-1">
              {/* <EvilnessWidget /> */}
            </div>
          </div>
        </div>
      </div>

      <div className="border border-[var(--theme-accent)]/30 bg-[var(--theme-background)]/40 flex flex-col">
        <div className="bg-[var(--theme-accent)]/10 border-b border-[var(--theme-accent)]/30 p-2 font-bold tracking-widest uppercase">
          SISTEMA & ANOMALIAS GLOBAIS
        </div>
        <div className="p-4">
          <SystemModifiersWidget />
        </div>
      </div>
    </div>
  );
}
