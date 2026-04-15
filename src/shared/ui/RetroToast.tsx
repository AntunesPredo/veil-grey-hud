import toast, { type ToastOptions } from "react-hot-toast";

const retroToastStyle: ToastOptions["style"] = {
  borderRadius: "0",
  background: "var(--theme-background)",
  color: "var(--theme-accent)",
  border: "1px solid var(--theme-accent)",
  fontFamily: "monospace",
  textTransform: "uppercase" as const,
  fontSize: "12px",
  boxShadow: "0 0 10px rgba(0,0,0,0.8)",
};

export const RetroToast = {
  info: (msg: string) => toast(`[INFO] ${msg}`, { style: retroToastStyle }),

  success: (msg: string) =>
    toast.success(`[SYS] ${msg}`, {
      style: {
        ...retroToastStyle,
        borderColor: "var(--theme-success)",
        color: "var(--theme-success)",
      },
      iconTheme: {
        primary: "var(--theme-success)",
        secondary: "var(--theme-backgroud)",
      },
    }),
  error: (msg: string) =>
    toast.error(`[ERR] ${msg}`, {
      style: {
        ...retroToastStyle,
        borderColor: "var(--theme-danger)",
        color: "#fff",
        background: "var(--theme-danger)",
      },
      iconTheme: { primary: "#fff", secondary: "var(--theme-danger)" },
    }),
  warning: (msg: string) =>
    toast(`[WARNING] ${msg}`, {
      style: {
        ...retroToastStyle,
        borderColor: "var(--theme-warning)",
        color: "var(--theme-warning)",
      },
      iconTheme: {
        primary: "var(--theme-warning)",
        secondary: "var(--theme-backgroud)",
      },
      duration: 500000,
    }),
};
