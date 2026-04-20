import { useEffect, useRef } from "react";

export function useResizeObserver(
  id: number | "MAIN",
  saveHeightFn: (id: number | "MAIN", height: number) => void,
) {
  const ref = useRef<HTMLDivElement & HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    let timeout: ReturnType<typeof setTimeout>;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newHeight = entry.borderBoxSize[0].blockSize;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          saveHeightFn(id, newHeight);
        }, 300);
      }
    });

    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [id, saveHeightFn]);

  return ref;
}
