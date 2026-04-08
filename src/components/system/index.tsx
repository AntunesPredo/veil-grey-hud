import { Settings } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { useSystemStore } from "../../store";
import { closeFullscreen } from "../../utils";

export function System() {
  const { setPowerState } = useSystemStore();

  return (
    <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto border-2 border-[#333] p-4 bg-[#050505]">
      <div className="flex justify-between items-center border-b-2 border-[#333] pb-2 mb-4">
        <h2 className="glow-text text-xl font-bold tracking-widest">
          VEIL GREY // HUD v3.0
        </h2>
        <button
          onClick={() => {
            setPowerState("SHUTTING_DOWN");
            setTimeout(() => closeFullscreen(), 600);
          }}
          className="text-[var(--theme-danger)] border border-[var(--theme-danger)] px-4 py-1 text-xs font-bold hover:bg-[var(--theme-danger)] hover:text-white transition-colors"
        >
          DESCONECTAR
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[340px_1fr_340px] gap-4 flex-1 overflow-hidden">
        <div className="border border-[#333] p-2 overflow-y-auto">
          Painel Esquerdo
        </div>
        <div className="border border-[#333] p-2 overflow-y-auto">
          Conteúdo Central
        </div>
        <div className="border border-[#333] p-2 overflow-y-auto">
          Painel Direito
        </div>
      </div>
    </div>
  );
}

export function FloatingSettings() {
  const { theme, setThemeColor } = useSystemStore();

  return (
    <div className="fixed bottom-6 right-6 z-[50] group">
      <button className="bg-[#0a0a0a] border-2 border-[var(--theme-accent)] p-3 text-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-black transition-colors shadow-[0_0_10px_var(--theme-accent)]">
        <Settings size={24} />
      </button>

      <div className="hidden group-hover:flex absolute bottom-full right-0 bg-[#0a0a0a] border-2 border-[#333] p-4 flex-col gap-6 w-[220px] shadow-[0_0_20px_rgba(0,0,0,0.9)]">
        <h3 className="border-b border-[#333] pb-1 font-bold text-sm tracking-widest">
          SISTEMA VISUAL
        </h3>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold">FÓSFORO PRIMÁRIO</label>
          <div className="custom-layout">
            <HexColorPicker
              color={theme.accent}
              onChange={(color) => setThemeColor("accent", color)}
            />
          </div>
          <div className="text-xs text-center border border-[#333] p-1 mt-1 font-mono uppercase">
            {theme.accent}
          </div>
        </div>

        {/* Color Picker: DANGER */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-[var(--theme-danger)]">
            COR DE ALERTA
          </label>
          <div className="custom-layout">
            <HexColorPicker
              color={theme.danger}
              onChange={(color) => setThemeColor("danger", color)}
            />
          </div>
          <div className="text-xs text-center border border-[#333] p-1 mt-1 font-mono uppercase text-[var(--theme-danger)]">
            {theme.danger}
          </div>
        </div>
      </div>
    </div>
  );
}
