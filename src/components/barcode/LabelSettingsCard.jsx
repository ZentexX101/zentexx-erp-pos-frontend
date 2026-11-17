import { LuInfo, LuPrinter } from "react-icons/lu";
import { LABEL_SIZES } from "../../utils/barcodeLabels";
import Button from "../common/buttons/Button";
import ToggleField from "../common/forms/ToggleField";
import { SectionHeading } from "../purchase/PickerCard";
import BarcodeLabel from "./BarcodeLabel";

const MM = 3.78; // px per mm on screen
const SAMPLE = { key: "sample", product: { name: "Sample product name", barcode: "2000000000017" }, price: 450 };

const GROUPS = [
  { kind: "sheet", title: "Normal printer · A4 paper", note: "Many labels on each A4 page (sticker sheet, or plain paper you cut)" },
  { kind: "thermal", title: "Label printer · roll", note: "Only for a thermal label printer (Xprinter, TSC…): one label per sticker" },
];

// Label size, what's on the label, a live preview (the first picked product) and the Print button
const LabelSettingsCard = ({ settings, onChange, size, previewItem, totalLabels, onPrint, printBlocked }) => {
  const scale = Math.min(2.4, 280 / (size.width * MM));

  return (
    <section className="min-w-0 space-y-5 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
      <SectionHeading step="2" eyebrow="Label" title="Size & print" />

      {/* Preview at the real proportions */}
      <div className="flex justify-center rounded-lg bg-[radial-gradient(circle,_#e2e8f0_1px,_transparent_1px)] bg-slate-50 py-6 ring-1 ring-slate-200 [background-size:12px_12px]">
        <div style={{ width: size.width * MM * scale, height: size.height * MM * scale }}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
            <BarcodeLabel item={previewItem ?? SAMPLE} size={size} settings={settings} className="rounded-sm shadow-md ring-1 ring-slate-300" />
          </div>
        </div>
      </div>

      {GROUPS.map((group) => (
        <div key={group.kind}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{group.title}</p>
          <p className="mb-2 text-[11px] text-slate-400">{group.note}</p>
          <div className="grid grid-cols-2 gap-2">
            {LABEL_SIZES.filter((s) => s.kind === group.kind).map((s) => {
              const active = s.id === settings.size;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({ size: s.id })}
                  className={`rounded-lg px-3 py-2 text-left ring-1 transition ${
                    active ? "bg-brand text-white ring-brand" : "bg-white text-slate-800 ring-slate-200 hover:ring-slate-300"
                  }`}
                >
                  <span className="block text-sm font-semibold">{s.label}</span>
                  <span className={`block text-[11px] ${active ? "text-white/70" : "text-slate-500"}`}>{s.hint}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="space-y-4 border-t border-slate-100 pt-4">
        <ToggleField
          label="Business name on top"
          description="The name from Settings > Shop."
          checked={settings.showTopText}
          onChange={(on) => onChange({ showTopText: on })}
        />
        {size.kind === "sheet" && (
          <ToggleField
            label="Cut lines"
            description="A light dashed border for plain paper you cut with scissors. Turn off for ready-cut sticker sheets."
            checked={settings.cutLines}
            onChange={(on) => onChange({ cutLines: on })}
          />
        )}
        <ToggleField
          label="Selling price"
          description="This branch's current price. Reprint the labels when the price changes."
          checked={settings.showPrice}
          onChange={(on) => onChange({ showPrice: on })}
        />
      </div>

      <div className="space-y-3 border-t border-slate-100 pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-slate-600">Labels to print</span>
          <span className="text-2xl font-bold tabular-nums text-slate-900">{totalLabels}</span>
        </div>
        <Button onClick={onPrint} disabled={Boolean(printBlocked) || totalLabels === 0} className="w-full py-3 text-base">
          <LuPrinter className="h-5 w-5" aria-hidden="true" />
          Print Labels
        </Button>
        {printBlocked && <p className="text-center text-xs text-amber-700">{printBlocked}</p>}
        <p className="flex gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 ring-1 ring-slate-200">
          <LuInfo className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          <span>
            {size.kind === "thermal"
              ? `In the print window pick your label printer, paper size ${size.width} × ${size.height} mm, margins "None" and scale 100%.`
              : 'In the print window pick A4, margins "None", scale 100% (not "Fit to page") and turn off "Headers and footers".'}
          </span>
        </p>
      </div>
    </section>
  );
};

export default LabelSettingsCard;
