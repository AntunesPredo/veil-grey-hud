import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PowerState = "STANDBY" | "BOOTING" | "ONLINE" | "SHUTTING_DOWN";

interface ThemeColors {
  background: string;
  accent: string;
  danger: string;
  warning: string;
  success: string;
  border: string;
}

interface SystemState {
  powerState: PowerState;
  theme: ThemeColors;
  setPowerState: (state: PowerState) => void;
  setThemeColor: (key: keyof ThemeColors, value: string) => void;
}

const defaultTheme: ThemeColors = {
  background: "#0a0a0a",
  accent: "#6a8a8e",
  danger: "#8b0000",
  warning: "#cc7a00",
  success: "#004d00",
  border: "#2c2c2c",
};

export const useSystemStore = create<SystemState>()(
  persist(
    (set) => ({
      powerState: "STANDBY",
      theme: defaultTheme,
      setPowerState: (state) => set({ powerState: state }),
      setThemeColor: (key, value) =>
        set((state) => ({ theme: { ...state.theme, [key]: value } })),
    }),
    {
      name: "vg-system-storage",
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);
