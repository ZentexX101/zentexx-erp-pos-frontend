import { getBusinessName } from "../../utils/businessName";
import BarcodeSvg from "./BarcodeSvg";

// "৳1,250" (no paisa when it's a whole number, so it fits a small label)
const labelPrice = (price) => {
  const value = Number(price) || 0;
  return `৳${value.toLocaleString("en-IN", { maximumFractionDigits: Number.isInteger(value) ? 0 : 2 })}`;
};

// One sticker, drawn at its real size in mm (the same component for the preview and the print).
// item: { product: { name, barcode }, price }; size: from utils/barcodeLabels; settings: { showTopText, showPrice } (the top line is the business name)
// cutLines: a light dashed edge, for cutting labels out of plain A4 paper
const BarcodeLabel = ({ item, size, settings, cutLines = false, className = "" }) => {
  // Font sizes follow the label height (25 mm is the base), so small A4 stickers stay readable
  const scale = Math.min(Math.max(size.height / 25, 0.8), 1.3);
  const pt = (n) => `${(n * scale).toFixed(2)}pt`;
  const code = item.product.barcode;
  const showPrice = settings.showPrice && Number(item.price) > 0;

  return (
    <div
      className={`flex flex-col overflow-hidden bg-white text-black ${className}`}
      style={{ width: `${size.width}mm`, height: `${size.height}mm`, padding: "1.2mm 2mm",
        // Nirmala UI / Noto Sans Bengali have the ৳ sign (Arial doesn't)
        fontFamily: 'Arial, "Nirmala UI", "Noto Sans Bengali", Helvetica, sans-serif',
        outline: cutLines ? "0.2mm dashed #b5b5b5" : undefined,
        outlineOffset: "-0.1mm",
      }}
    >
      {settings.showTopText && (
        <p className="truncate text-center font-bold uppercase leading-none" style={{ fontSize: pt(5.5), letterSpacing: "0.06em" }}>
          {getBusinessName()}
        </p>
      )}
      <p
        className="mt-[0.6mm] text-center font-semibold uppercase leading-[1.1]"
        style={{ fontSize: pt(6.5), display: "-webkit-box", WebkitLineClamp: size.height < 28 ? 1 : 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
      >
        {item.product.name}
      </p>

      {/* The bars, with a small quiet zone on each side so scanners find the edges */}
      <div className="mt-[0.8mm] min-h-0 flex-1 px-[1.5mm]">{code && <BarcodeSvg value={code} />}</div>

      <div className={`mt-[0.4mm] flex items-baseline gap-1 leading-none ${showPrice ? "justify-between" : "justify-center"}`}>
        <span className="font-mono" style={{ fontSize: pt(6), letterSpacing: "0.08em" }}>
          {code}
        </span>
        {showPrice && (
          <span className="font-bold" style={{ fontSize: pt(8) }}>
            {labelPrice(item.price)}
          </span>
        )}
      </div>
    </div>
  );
};

export default BarcodeLabel;
