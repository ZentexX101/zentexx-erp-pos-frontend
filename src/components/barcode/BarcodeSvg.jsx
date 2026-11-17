import JsBarcode from "jsbarcode";
import { useLayoutEffect, useRef } from "react";
import { barcodeFormat } from "../../utils/barcodeLabels";

// The bars only (the digits are printed by the label in HTML, so they stay sharp at any size).
// It stretches to fill its box; all bars scale together, so scanners still read it.
const BarcodeSvg = ({ value, className = "" }) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (!ref.current || !value) return;
    try {
      JsBarcode(ref.current, value, { format: barcodeFormat(value), displayValue: false, margin: 0, height: 60, width: 2, background: "transparent" });
    } catch {
      // A code the format can't draw: fall back to Code 128, which takes any text
      JsBarcode(ref.current, value, { format: "CODE128", displayValue: false, margin: 0, height: 60, width: 2, background: "transparent" });
    }
    const svg = ref.current;
    const width = svg.getAttribute("width");
    const height = svg.getAttribute("height");
    svg.setAttribute("viewBox", `0 0 ${parseFloat(width)} ${parseFloat(height)}`);
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.removeAttribute("style");
  }, [value]);

  return <svg ref={ref} preserveAspectRatio="none" className={`block h-full w-full ${className}`} aria-label={`Barcode ${value}`} role="img" />;
};

export default BarcodeSvg;
