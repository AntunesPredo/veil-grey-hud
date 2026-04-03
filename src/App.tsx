import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSystemStore } from "./store";
import { Settings } from "lucide-react";
import { HexColorPicker } from "react-colorful";
export default function App() {
  const { powerState, setPowerState, theme } = useSystemStore();

  const cssVars = {
    "--theme-accent": theme.accent,
    "--theme-danger": theme.danger,
    "--theme-warning": theme.warning,
    "--theme-success": theme.success,
  } as React.CSSProperties;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (powerState === "BOOTING") {
      timer = setTimeout(() => setPowerState("ONLINE"), 3000);
    } else if (powerState === "SHUTTING_DOWN") {
      timer = setTimeout(() => setPowerState("STANDBY"), 800);
    }
    return () => clearTimeout(timer);
  }, [powerState, setPowerState]);

  useEffect(() => {
    const disableContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener("contextmenu", disableContextMenu);
    return () => window.removeEventListener("contextmenu", disableContextMenu);
  }, []);

  return (
    <div
      style={cssVars}
      className="min-h-screen w-full flex items-center justify-center relative bg-black text-[var(--theme-accent)]"
    >
      {/* CAMADA CRT OVERLAY FIXA NO TOPO */}
      <div className="crt-overlay flicker-effect fixed inset-0 z-[9999] pointer-events-none"></div>

      <AnimatePresence mode="wait">
        {powerState === "STANDBY" && (
          <motion.button
            key="standby-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPowerState("BOOTING")}
            className="border-2 border-[var(--theme-accent)] px-8 py-3 font-bold uppercase tracking-[0.2em] hover:bg-[var(--theme-accent)] hover:text-black transition-colors z-50 shadow-[0_0_15px_var(--theme-accent)]"
          >
            INICIAR TERMINAL
          </motion.button>
        )}

        {(powerState === "BOOTING" ||
          powerState === "ONLINE" ||
          powerState === "SHUTTING_DOWN") && (
          <motion.div
            key="screen-content"
            initial={{ scaleY: 0.01, scaleX: 0, opacity: 0 }}
            animate={
              powerState === "SHUTTING_DOWN"
                ? {
                    scaleY: 0.005,
                    scaleX: 0,
                    opacity: 0,
                    filter: "brightness(2) contrast(1.5)",
                  }
                : {
                    scaleY: 1,
                    scaleX: 1,
                    opacity: 1,
                    filter: "brightness(1) contrast(1)",
                  }
            }
            transition={{
              duration: powerState === "SHUTTING_DOWN" ? 0.3 : 0.4,
              ease: "easeInOut",
            }}
            className="absolute inset-0 p-4 flex flex-col z-10"
          >
            {powerState === "BOOTING" ? (
              <div className="flex-1 flex flex-col items-center justify-center glow-text">
                <h1 className="text-5xl font-bold tracking-[0.5em] mb-4">
                  OMNIMEDIA
                </h1>
                <p className="animate-pulse text-lg tracking-widest uppercase">
                  Inicializando sistema...
                </p>
              </div>
            ) : (
              <MainHUD />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {powerState === "ONLINE" && <FloatingSettings />}
    </div>
  );
}

function MainHUD() {
  const { setPowerState } = useSystemStore();

  return (
    <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto border-2 border-[#333] p-4 bg-[#050505]">
      <div className="flex justify-between items-center border-b-2 border-[#333] pb-2 mb-4">
        <h2 className="glow-text text-xl font-bold tracking-widest">
          VEIL GREY // HUD v3.0
        </h2>
        <button
          onClick={() => setPowerState("SHUTTING_DOWN")}
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

function FloatingSettings() {
  const { theme, setThemeColor } = useSystemStore();

  return (
    <div className="fixed bottom-6 right-6 z-[50] group">
      <button className="bg-[#0a0a0a] border-2 border-[var(--theme-accent)] p-3 text-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-black transition-colors shadow-[0_0_10px_var(--theme-accent)]">
        <Settings size={24} />
      </button>

      <div className="hidden group-hover:flex absolute bottom-full right-0 mb-4 bg-[#0a0a0a] border-2 border-[#333] p-4 flex-col gap-6 w-[220px] shadow-[0_0_20px_rgba(0,0,0,0.9)]">
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
