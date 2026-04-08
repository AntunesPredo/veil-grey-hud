import { useSystemStore } from "../store";

const createCursor = (svgContent: string, color: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">${svgContent}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 12 12`;
};

const useCursor = (
  type: "DEFAULT" | "CLICK" | "POINTER" | "POINTER_CLICK" | "TEXT",
) => {
  const { theme } = useSystemStore();
  const accent = theme.accent;

  let svg = "";
  switch (type) {
    case "DEFAULT":
      svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="24" viewBox="0 0 20 20" fill="none">
        <path d="M19.9689 8.30869L11.311 11.3111L8.30787 19.9697L5.81622e-05 0.000185978L19.9689 8.30869Z" fill="${accent}" stroke="black"/>
      </svg>`;

      return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 12 12`;

    case "CLICK":
      svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 20 22" fill="none">
        <path d="M19.9688 10.1675L11.3105 13.1694L8.30762 21.8286L0 1.85889L19.9688 10.1675ZM11.3271 0.808105C12.3895 -0.254136 14.0946 -0.270985 15.1357 0.77002C16.1769 1.81114 16.1599 3.5162 15.0977 4.57861C14.0354 5.64089 12.3303 5.65846 11.2891 4.61768C10.2479 3.57652 10.2647 1.87051 11.3271 0.808105Z" fill="${accent}" stroke="black"/>
      </svg>`;

      return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 12 12`;

    case "POINTER":
      svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 27 27" fill="none">
          <path xmlns="http://www.w3.org/2000/svg" d="M3.72192 13.0309L5.90124 10.8516L4.04025 8.99063L-6.039e-05 13.0309L4.02437 17.0554L5.88536 15.1944L3.72192 13.0309ZM13.031 -0.00012078L8.99 4.04088L10.851 5.90187L13.0296 3.72324L15.1931 5.88668L17.0554 4.02431L13.031 -0.00012078ZM15.2089 20.1593L13.0296 22.3387L10.8351 20.1441L8.97412 22.0051L13.031 26.062L17.0713 22.0217L15.2089 20.1593ZM22.0052 8.97406L20.1428 10.8364L22.3373 13.0309L20.1587 15.2096L22.0211 17.072L26.0621 13.0309L22.0052 8.97406Z" fill="${accent}" stroke="black"/>
        </svg>`;

      return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 12 12`;

    case "POINTER_CLICK":
      svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 27 27" fill="none">
          <path xmlns="http://www.w3.org/2000/svg" d="M3.72192 13.0309L5.90124 10.8516L4.04025 8.99063L-6.039e-05 13.0309L4.02437 17.0554L5.88536 15.1944L3.72192 13.0309ZM13.031 -0.00012078L8.99 4.04088L10.851 5.90187L13.0296 3.72324L15.1931 5.88668L17.0554 4.02431L13.031 -0.00012078ZM14.8906 13.0309L20.4674 7.45419L18.6064 5.5932L13.0296 11.17L7.44666 5.58699L5.58498 7.44867L11.1679 13.0316L5.605 18.5946L7.46599 20.4556L13.0289 14.8926L18.6043 20.468L20.466 18.6063L14.8906 13.0309ZM15.2089 20.1593L13.0296 22.3387L10.8351 20.1441L8.97412 22.0051L13.031 26.062L17.0713 22.0217L15.2089 20.1593ZM22.0052 8.97406L20.1428 10.8364L22.3373 13.0309L20.1587 15.2096L22.0211 17.072L26.0621 13.0309L22.0052 8.97406Z" fill="${accent}" stroke="black"/>
        </svg>`;

      return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 12 12`;

    case "TEXT":
      svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="16" viewBox="0 0 12 16" fill="none">
          <path xmlns="http://www.w3.org/2000/svg" d="M7.38574 3.07617V12.9238L12 16H0L4.61426 12.9238V3.07617L0 0H12L7.38574 3.07617Z" fill="${accent}" stroke="black"/>
        </svg>`;

      return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 12 12`;
  }
};

export function DynamicCursor() {
  const { theme } = useSystemStore();
  const c = theme.accent;

  const grabSvg = `<path d="M8 6h8M8 12h8M8 18h8"/>`;
  const grabbedSvg = `<rect x="6" y="4" width="12" height="16"/><path d="M10 8h4M10 12h4M10 16h4"/>`;

  const cursors = {
    //  Default Cursor and Click Effect
    default: useCursor("DEFAULT"),
    click: useCursor("CLICK"),
    // Pointer Cursor and Click Effect
    pointer: useCursor("POINTER"),
    pointerClick: useCursor("POINTER_CLICK"),
    // Text Cursor
    text: useCursor("TEXT"),

    grab: createCursor(grabSvg, c),
    grabbing: createCursor(grabbedSvg, c),
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
          cursor: ${cursors.pointerClick}, pointer !important;
        }
      `}
    </style>
  );
}
