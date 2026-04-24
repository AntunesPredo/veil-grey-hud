import { HealthWidget } from "./HealthWidget";
import { MadnessGaugeWidget } from "./MadnessGaugeWidget";
import { SystemModifiersWidget } from "./SystemModifiersWidget";

function WidgetBlade({
  title,
  number,
  children,
  classContainer,
}: {
  title: string;
  number: string;
  children: React.ReactElement;
  classContainer?: string;
}) {
  return (
    <div className="border-2 border-[var(--theme-border)] bg-[var(--theme-background)] flex flex-col relative group">
      <div className="bg-[var(--theme-accent)] text-black border-b-2 border-[var(--theme-border)] px-3 py-1.5 font-bold tracking-[0.2em] uppercase text-xs flex justify-between">
        <span>{title.toUpperCase()}</span>
        <span className="opacity-70">BLADE_{number.padStart(2, "0")}</span>
      </div>
      <div className={`flex flex-col gap-6 flex-1 ${classContainer}`}>
        {children}
      </div>
    </div>
  );
}

export function VitalsPanel() {
  return (
    <div className="flex flex-col gap-6 p-4 bg-[var(--theme-background)] border-4 border-double border-[var(--theme-border)] relative">
      <div className="flex justify-center items-center gap-4 mb-2 border-b-2 border-[var(--theme-border)] pb-2">
        <div className="w-3 h-3 bg-[var(--theme-accent)] animate-pulse" />
        <h2 className="font-mono font-black text-[var(--theme-accent)] tracking-[0.3em] uppercase text-xl">
          SYS.VITALS
        </h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <WidgetBlade
          title="Sistema de Suporte à vida"
          number="1"
          classContainer="p-5"
        >
          <>
            <HealthWidget />

            {/* Divisória Mecânica para Fome/Energia */}
            <div className="border-t-2 border-dashed border-[var(--theme-border)] pt-5 grid grid-cols-2 gap-4 flex-1">
              <div className="flex flex-col justify-center relative">
                <span className="absolute -top-3 left-2 bg-black px-2 text-[8px] font-mono text-[var(--theme-border)] tracking-widest">
                  SLOT: NUTRITION
                </span>
                {/* <SustenanceWidget /> */}
                <div className="h-16 border border-[var(--theme-border)] opacity-20 flex items-center justify-center font-mono text-xs">
                  Aguardando Módulo...
                </div>
              </div>
              <div className="border-l-2 border-dashed border-[var(--theme-border)] pl-4 relative">
                <span className="absolute -top-3 left-6 bg-black px-2 text-[8px] font-mono text-[var(--theme-border)] tracking-widest">
                  SLOT: ENERGY
                </span>
                {/* <EnergyWidget /> */}
                <div className="h-16 border border-[var(--theme-border)] opacity-20 flex items-center justify-center font-mono text-xs">
                  Aguardando Módulo...
                </div>
              </div>
            </div>
          </>
        </WidgetBlade>
        <WidgetBlade title="Medidor de Sanidade" number="2">
          <MadnessGaugeWidget />
        </WidgetBlade>
      </div>
      <WidgetBlade
        title="Sistema de modificadores"
        number="3"
        classContainer="p-5"
      >
        <SystemModifiersWidget />
      </WidgetBlade>
    </div>
  );
}
