import { NotesManager } from "./NotesManager";

export function BioPanel() {
  return (
    <div className="h-full relative">
      <div className="border border-[var(--theme-accent)]/30 bg-[var(--theme-background)]/40 flex flex-col h-full overflow-hidden">
        <div className="bg-[var(--theme-accent)]/10 border-b border-[var(--theme-accent)]/30 p-2 font-bold tracking-widest flex justify-between z-10 shadow-md uppercase">
          <span>BIO & ANOTAÇÕES</span>
        </div>
        <div className="p-4 flex flex-col gap-4 overflow-y-auto  flex-1 ">
          <NotesManager />
        </div>
      </div>
    </div>
  );
}
