import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { DynamicCursor } from "./DynamicCursor.tsx";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DynamicCursor />
    <App />
  </StrictMode>,
);
