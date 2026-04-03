import { useSystemStore } from "./store";

const createCursor = (svgContent: string, color: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">${svgContent}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 12 12`;
};

export function DynamicCursor() {
  const { theme } = useSystemStore();
  const c = theme.accent;

  const defaultSvg = `<path d="M12 2v6M12 16v6M2 12h6M16 12h6"/><circle cx="12" cy="12" r="2" fill="${c}"/>`;

  const pointerSvg = `<rect x="4" y="4" width="16" height="16"/><circle cx="12" cy="12" r="2" fill="${c}"/>`;

  const buttonClickSvg = `<rect x="4" y="4" width="16" height="16"/><path d="M8 8l8 8M16 8l-8 8"/>`;

  const grabSvg = `<path d="M8 6h8M8 12h8M8 18h8"/>`;
  const grabbedSvg = `<rect x="6" y="4" width="12" height="16"/><path d="M10 8h4M10 12h4M10 16h4"/>`;
  const textSvg = `<path d="M8 4h8M12 4v16M8 20h8"/>`;
  const clickSvg = `<path d="M12 2v6M12 16v6M2 12h6M16 12h6"/><circle cx="12" cy="12" r="5" fill="${c}"/>`;

  const cursors = {
    default: createCursor(defaultSvg, c),
    pointer: createCursor(pointerSvg, c),
    buttonClick: createCursor(buttonClickSvg, c),
    grab: createCursor(grabSvg, c),
    grabbing: createCursor(grabbedSvg, c),
    text: createCursor(textSvg, c),
    click: createCursor(clickSvg, c),
  };

  return (
    <style>
      {`
        body, html {
          cursor: ${cursors.default}, auto !important;
        }

        .react-colorful, .react-colorful * {
          cursor: ${cursors.pointer}, pointer !important;
        }

        button, a, select, [role="button"], input[type="color"], input[type="submit"], input[type="button"] {
          cursor: ${cursors.pointer}, pointer !important;
        }

        input:not([type="color"]):not([type="submit"]):not([type="button"]), textarea, p, h1, h2, h3, span, label, strong, em {
          cursor: ${cursors.text}, text !important;
        }

        .cursor-grab, .cursor-grab * {
          cursor: ${cursors.grab}, grab !important;
        }
        
        .cursor-grabbing, .cursor-grabbing * {
          cursor: ${cursors.grabbing}, grabbing !important;
        }

        body:active {
          cursor: ${cursors.click}, auto !important;
        }
        
        button:active, a:active, [role="button"]:active, .react-colorful__interactive:active {
          cursor: ${cursors.buttonClick}, pointer !important;
        }
      `}
    </style>
  );
}
