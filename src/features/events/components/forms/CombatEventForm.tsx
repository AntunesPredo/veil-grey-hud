export function CombatEventForm() {
  return (
    <div className="flex flex-col gap-4 p-4 border border-[var(--theme-accent)]/30 bg-[var(--theme-accent)]/5">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-[var(--theme-accent)] tracking-widest uppercase">
          EVENTO DE COMBATE
        </span>
        <span className="text-xs text-[var(--theme-text)]">
          Nenhuma configuração extra é necessária. Os jogadores e NPCs (monstros/aliados) poderão ingressar no combate na Interface de Eventos.
          Ao ingressar, a iniciativa será rolada automaticamente (Agilidade).
          Você, como Mestre, poderá editar os turnos e rodadas pelo painel ativo.
        </span>
      </div>
    </div>
  );
}
