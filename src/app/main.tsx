import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { motion } from "framer-motion";
import "./index.css";
import App from "./App";
import toast, { ToastBar, Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          maxWidth: "none",
        },
      }}
    >
      {(t) => (
        <motion.div
          layout
          initial={{
            opacity: 0,
            clipPath: "inset(50% 0 50% 0)",
            filter: "blur(4px) brightness(2)",
          }}
          animate={{
            opacity: t.visible ? 1 : 0,
            clipPath: t.visible ? "inset(0% 0 0% 0)" : "inset(50% 0 50% 0)",
            filter: t.visible
              ? "blur(0px) brightness(1)"
              : "blur(4px) brightness(2)",
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <ToastBar toast={t} style={{ ...t.style, animation: "none" }}>
            {({ icon, message }) => (
              <>
                {icon}
                {message}
                {t.type !== "loading" && (
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="ml-2 opacity-70 hover:opacity-100 hover:text-white transition-all cursor-pointer"
                  >
                    <div className="w-[28px]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        shapeRendering="crispEdges"
                      >
                        <rect x="3" y="3" width="18" height="18" />
                        <line x1="7" y1="7" x2="17" y2="17" />
                        <line x1="17" y1="7" x2="7" y2="17" />
                      </svg>
                    </div>
                  </button>
                )}
              </>
            )}
          </ToastBar>
        </motion.div>
      )}
    </Toaster>
    <App />
  </StrictMode>,
);
