import { useEffect } from "react";

// Once `data` is set (and its print-only view is on the page), opens the browser's print /
// save-as-PDF dialog, then calls onDone so the page can drop the print view again
export const usePrintWhenReady = (data, onDone) => {
  useEffect(() => {
    if (!data) return;
    window.addEventListener("afterprint", onDone, { once: true });
    window.print();
    return () => window.removeEventListener("afterprint", onDone);
  }, [data, onDone]);
};
