import { useEffect, useRef, useState } from "react";
import { useSystemStore } from "../../shared/store/useSystemStore";
import { GlitchImage } from "../../shared/ui/GlitchImage";
import { motion, AnimatePresence } from "framer-motion";

const BOOT_STEPS = [
  { prc: 5, msg: "LOADING KERNEL V4.12.0-PROTETORATE..." },
  { prc: 12, msg: "INITIALIZING OMNIMEDIA INTERFACE..." },
  { prc: 18, msg: "DECRYPTING NEURAL LINK..." },
  { prc: 25, msg: "ESTABLISHING HANDSHAKE WITH SECTOR-7..." },
  { prc: 32, msg: "CHECKING CITIZEN PRIVILEGES..." },
  { prc: 40, msg: "MOUNTING LOGISTIC_DRIVE_A..." },
  { prc: 45, msg: "SYNCING DATABASE: VEIL_GREY_MAIN..." },
  { prc: 55, msg: "INJECTING CSS_OVERRIDE: CRT_FLICKER..." },
  { prc: 62, msg: "LOADING ASSETS: CHARACTER_MATRIZ..." },
  { prc: 70, msg: "VALIDATING INTEGRITY: OK." },
  { prc: 78, msg: "CONNECTING TO DISCORD_WEBHOOKS..." },
  { prc: 85, msg: "PREPARING HUD INTERFACE..." },
  { prc: 92, msg: "CLEARING TEMPORARY CACHE..." },
  { prc: 98, msg: "SYSTEM READY." },
];

export function Booting() {
  const { setPowerState } = useSystemStore();
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const progressRef = useRef(0);

  useEffect(() => {
    const startupTimer = setTimeout(() => setIsStarted(true), 2000);

    if (isStarted) {
      const interval = setInterval(() => {
        const inc =
          Math.random() > 0.8 ? Math.random() * 18 : Math.random() * 2.5;
        const next = Math.min(progressRef.current + inc, 100);

        progressRef.current = next;
        setProgress(next);

        const currentStep = BOOT_STEPS.find(
          (s) => next >= s.prc && !logs.includes(s.msg),
        );
        if (currentStep) {
          setLogs((prev) => [currentStep.msg, ...prev].slice(0, 8));
        }

        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => setPowerState("ONLINE"), 900);
        }
      }, 150);

      return () => clearInterval(interval);
    }

    return () => clearTimeout(startupTimer);
  }, [isStarted, setPowerState, logs]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full bg-black overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center glow-text mt-[-100px]"
      >
        <GlitchImage
          src={
            new URL(
              "../../assets/images/logos/protetorate.svg",
              import.meta.url,
            ).href
          }
          alt="Protetorado - Logo"
          containerClassName="w-64 h-64 bg-transparent border-none"
          className="object-contain"
          glitchIntensity="low"
        />
        <h1 className="text-5xl font-bold tracking-[0.5em] mb-1">ID-SYS</h1>
        <h2 className="text-sm font-bold tracking-[0.2em] text-center text-[var(--theme-accent)] opacity-70">
          CONECTANDO VOCÊ A UMA SOCIEDADE MAIS EFICIENTE.
        </h2>
      </motion.div>

      <div className="w-[80vw] p-4 flex flex-col gap-2">
        <div className="flex items-center gap-4 w-full">
          <div className="flex-1 h-[2px] bg-[var(--theme-accent)]/10 relative overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-[var(--theme-accent)] shadow-[0_0_10px_var(--theme-accent)]"
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
          <span className="font-mono text-xl font-bold w-16 text-right tabular-nums">
            {Math.floor(progress)}%
          </span>
        </div>

        <div className="h-32 w-full font-mono text-[10px] space-y-1 opacity-60">
          <AnimatePresence mode="popLayout">
            {logs.map((log, i) => (
              <motion.p
                key={log}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1 - i * 0.15, x: 0 }}
                exit={{ opacity: 0 }}
                className="tracking-widest uppercase"
              >
                {`> ${log}`}
              </motion.p>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
