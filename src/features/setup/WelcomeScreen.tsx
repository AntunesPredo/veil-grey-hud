import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useCharacterStore } from "../character/store";
import { Button, Input } from "../../shared/ui/Form";
import { RetroToast } from "../../shared/ui/RetroToast";
import { GlitchImage } from "../../shared/ui/GlitchImage";

const fadeVariants: Variants = {
  hidden: { opacity: 0, filter: "blur(4px)", scale: 0.95 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
    transition: { duration: 0.8, ease: "easeOut" } as const,
  },
  exit: {
    opacity: 0,
    filter: "blur(4px)",
    scale: 1.05,
    transition: { duration: 0.5, ease: "easeIn" } as const,
  },
};

export function WelcomeScreen() {
  const updateProgression = useCharacterStore(
    (state) => state.updateProgression,
  );
  const [localName, setLocalName] = useState("");

  const [step, setStep] = useState<"presentation" | "identification">(
    "presentation",
  );

  useEffect(() => {
    if (step === "presentation") {
      const timer = setTimeout(() => {
        setStep("identification");
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleStart = () => {
    if (!localName.trim()) {
      RetroToast.error("IDENTIFICAÇÃO OBRIGATÓRIA.");
      return;
    }
    updateProgression({ name: localName, creationStatus: "PRE_STARTED" });
  };

  const handleSandbox = () => {
    updateProgression({
      name: localName || "NO-NAME",
      sandboxMode: true,
      creationStatus: "CLOSED",
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-lg mx-auto p-6 text-center">
      <AnimatePresence mode="wait">
        {step === "presentation" ? (
          <motion.div
            key="presentation"
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center gap-6 cursor-pointer w-full"
            onClick={() => setStep("identification")}
            title="Clique para pular"
          >
            <p className="text-[var(--theme-text)] text-xs tracking-widest animate-pulse">
              SISTEMA CONTROLADO POR:
            </p>

            <GlitchImage
              src={
                new URL(
                  "../../assets/images/logos/omnimedia_logo.svg",
                  import.meta.url,
                ).href
              }
              alt="Omnimedia Logo"
              containerClassName="w-40 h-40 bg-transparent border-none"
              className="object-contain"
              glitchIntensity="high"
              noLoad
            />

            <div className="flex flex-col gap-1">
              <h1 className="text-4xl font-bold tracking-[0.2em] text-[var(--theme-accent)] glow-text">
                OMNIMEDIA
              </h1>
              <h1 className="text-4xl font-bold tracking-[0.2em] text-[var(--theme-accent)] glow-text">
                GROUP
              </h1>
            </div>

            <p className="text-[var(--theme-text)] text-sm tracking-widest italic mt-4 px-4">
              "Os olhos do Protetorado, a voz do povo."
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="identification"
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center w-full"
          >
            <GlitchImage
              src={
                new URL(
                  "../../assets/images/logos/omnimedia_logo.svg",
                  import.meta.url,
                ).href
              }
              alt="Omnimedia Logo"
              containerClassName="w-24 h-24 bg-transparent border-none opacity-80"
              className="object-contain"
              glitchIntensity="low"
            />

            <div className="w-full flex flex-col gap-4 mt-8 mb-6 bg-[var(--theme-background)]/80 p-6 border border-[var(--theme-border)] shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <div className="flex flex-col gap-2 text-center">
                <label className="text-[10px] text-[var(--theme-accent)] font-bold tracking-widest">
                  IDENTIFIQUE-SE
                </label>
                <Input
                  type="text"
                  placeholder="NOME/ID"
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && localName.trim() && handleStart()
                  }
                  className="w-full text-center text-lg py-2 font-bold"
                  autoFocus
                />
              </div>
              <Button className="w-full py-3" onClick={handleStart}>
                INICIAR PROTOCOLO
              </Button>
            </div>
            <div className="border-t border-dashed border-[var(--theme-border)] pt-4 w-full">
              <Button
                variant="warning"
                className="w-full opacity-60 hover:opacity-100 border-none"
                onClick={handleSandbox}
              >
                [ ACESSAR MODO SANDBOX ]
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
