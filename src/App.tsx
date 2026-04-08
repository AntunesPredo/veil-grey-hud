import { useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useSystemStore } from "./store";
import { openFullscreen } from "./utils";
import { System } from "./components/system";
import { Booting } from "./components/Booting";
import { DynamicCursor } from "./components/DynamicCursor";

const inDevelopment = import.meta.env.VITE_IN_DEVELOPMENT === "true";

const screenVariants: Variants = {
  off: {
    scaleX: 0,
    scaleY: 0,
    opacity: 0,
    filter: "brightness(0)",
  },
  on: {
    scaleX: [2, 2, 2, 2, 2, 2, 2, 2, 2, 1.3, 1, 1],
    scaleY: [0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.6, 1, 1],
    y: [
      "0%",
      "100%",
      "-100%",
      "0%",
      "100%",
      "-100%",
      "0%",
      "100%",
      "-100%",
      "100%",
      "0%",
      "0%",
    ],
    opacity: [1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1],
    filter: [
      "brightness(30)",
      "brightness(30)",
      "brightness(30)",
      "brightness(30)",
      "brightness(30)",
      "brightness(30)",
      "brightness(30)",
      "brightness(30)",
      "brightness(30)",
      "brightness(30)",
      "contrast(0) brightness(0)",
      "contrast(1) brightness(1.2) saturate(1.3)",
    ],
    transition: {
      duration: 4,
      times: [
        0, 0.01, 0.015, 0.02, 0.025, 0.038, 0.049, 0.067, 0.083, 0.15, 0.2, 1,
      ],
      ease: "linear",
    },
  },
  online: {
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    y: "0%",
    filter: "contrast(1) brightness(1.2) saturate(1.3)",
  },
  shutting_down: {
    scaleX: [1, 1.3, 0],
    scaleY: [1.3, 0.001, 0],
    filter: ["brightness(1)", "brightness(10)", "brightness(50)"],
    y: "0%",
    opacity: [1, 1, 0],
    transition: {
      duration: 0.55,
      times: [0, 0.6, 1],
      ease: [0.23, 1.0, 0.32, 1.0],
    },
  },
};

export default function App() {
  const { powerState, setPowerState, theme } = useSystemStore();

  const cssVars = {
    "--theme-background": theme.background,
    "--theme-accent": theme.accent,
    "--theme-danger": theme.danger,
    "--theme-warning": theme.warning,
    "--theme-success": theme.success,
  } as React.CSSProperties;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (powerState === "BOOTING") {
      timer = setTimeout(() => setPowerState("ONLINE"), 4000);
    } else if (powerState === "SHUTTING_DOWN") {
      timer = setTimeout(() => setPowerState("STANDBY"), 800);
    }
    return () => clearTimeout(timer);
  }, [powerState, setPowerState]);

  useEffect(() => {
    if (inDevelopment) return;
    const disableContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener("contextmenu", disableContextMenu);
    return () => window.removeEventListener("contextmenu", disableContextMenu);
  }, []);

  return (
    <div
      style={cssVars}
      className="h-screen w-screen overflow-hidden flex items-center justify-center relative bg-black text-[var(--theme-accent)]"
    >
      <DynamicCursor />
      <div className="crt-overlay flicker-effect fixed inset-0 z-[9999] pointer-events-none"></div>

      <AnimatePresence mode="wait">
        {powerState === "STANDBY" && (
          <motion.button
            key="standby-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            onClick={() => {
              setPowerState("BOOTING");
              if (!inDevelopment) {
                openFullscreen();
              }
            }}
            className="border-2 border-[var(--theme-accent)] px-8 py-3 font-bold uppercase tracking-[0.2em] hover:bg-[var(--theme-accent)] hover:text-black transition-colors z-50 shadow-[0_0_15px_var(--theme-accent)] absolute"
          >
            INICIAR TERMINAL
          </motion.button>
        )}
      </AnimatePresence>
      {(powerState === "BOOTING" ||
        powerState === "ONLINE" ||
        powerState === "SHUTTING_DOWN") && (
        <motion.div
          key="screen-content"
          variants={screenVariants}
          initial="off"
          animate={
            powerState === "BOOTING"
              ? "on"
              : powerState === "ONLINE"
                ? "online"
                : "shutting_down"
          }
          className="absolute inset-0 p-4 flex flex-col z-10"
        >
          {powerState === "BOOTING" ? <Booting /> : <System />}
        </motion.div>
      )}
    </div>
  );
}
