export function SustenanceWidget() {
  // const { sustenance, currentLoad, maxLoad, updateSustenance } =
  //   useCharacterStore();
  // const susPorc =
  //   sustenance.limit === 0 ? 0 : (sustenance.current / sustenance.limit) * 100;

  return (
    <div className="flex flex-col gap-2">
      {/* <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex flex-col">
          <span className="font-bold text-[var(--theme-warning)]">
            ALIMENTAÇÃO (MÁX: {sustenance.limit})
          </span>
          {currentLoad > maxLoad && (
            <span className="text-[9px] text-[var(--theme-danger)] font-bold animate-pulse">
              SOBRECARREGADO: FOME x2
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            onClick={() => updateSustenance(sustenance.current - 1)}
          >
            -
          </Button>
          <Input
            type="number"
            value={sustenance.current}
            onChange={(e) => updateSustenance(parseInt(e.target.value))}
            className="w-12 text-center text-[var(--theme-warning)] border-[var(--theme-warning)]/50 focus:border-[var(--theme-warning)]"
          />
          <Button
            size="sm"
            onClick={() => updateSustenance(sustenance.current + 1)}
            disabled={currentLoad > maxLoad}
          >
            +
          </Button>
        </div>
      </div>
      <div className="h-3 bg-[var(--theme-background)]/80 border border-[var(--theme-warning)]/30 w-full relative overflow-hidden">
        <div
          className="h-full bg-[var(--theme-warning)] transition-all duration-300"
          style={{ width: `${susPorc}%` }}
        />
      </div>
      <div className="flex justify-between text-[9px] mt-1">
        <span
          className={
            sustenance.state === "STARVING"
              ? "text-[var(--theme-danger)] font-bold animate-pulse"
              : "text-[var(--theme-danger)]/50"
          }
        >
          INANIÇÃO
        </span>
        <span
          className={
            sustenance.state === "HUNGRY"
              ? "text-[var(--theme-warning)] font-bold"
              : "text-[var(--theme-warning)]/50"
          }
        >
          FAMINTO
        </span>
        <span
          className={
            sustenance.state === "SATIATED"
              ? "text-[var(--theme-accent)] font-bold"
              : "text-[var(--theme-accent)]/50"
          }
        >
          SACIADO
        </span>
        <span
          className={
            sustenance.state === "FULL"
              ? "text-[var(--theme-accent)] font-bold"
              : "text-[var(--theme-accent)]/50"
          }
        >
          CHEIO
        </span>
      </div> */}
    </div>
  );
}
