import { useState } from "react";
import { LuCheck, LuCpu, LuGlobe, LuHardDrive, LuPalette, LuPlus } from "react-icons/lu";
import { VARIANT_CHOICES } from "../../constants/product";

const ICONS = { color: LuPalette, ram: LuCpu, storage: LuHardDrive, region: LuGlobe };

// A small dot of the colour itself next to the colour chips (typed colours get none)
const SWATCHES = {
  Black: "#111827",
  White: "#ffffff",
  Blue: "#3b82f6",
  Green: "#22c55e",
  Purple: "#a855f7",
  Gold: "#d4a74a",
  Silver: "#cbd5e1",
  Red: "#ef4444",
  Titanium: "#8a8580",
};

const chipClass = (selected) =>
  `inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium ring-1 transition ${
    selected ? "bg-blue-50 text-blue-700 ring-blue-400" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300"
  }`;

// One attribute as a row: its name and pick on the left, the usual values as chips plus a box to type any other.
// Click the chosen chip again to clear it.
const Attribute = ({ field, value, onChange }) => {
  const { label, options, placeholder, hint } = VARIANT_CHOICES[field];
  const Icon = ICONS[field];
  const [typed, setTyped] = useState("");
  const shown = value && !options.includes(value) ? [...options, value] : options;

  const add = () => {
    const next = typed.trim();
    if (next) onChange(next);
    setTyped("");
  };

  return (
    <fieldset className="grid gap-3 px-4 py-4 sm:grid-cols-[9rem_1fr] sm:gap-4">
      <legend className="sr-only">{label}</legend>
      <div className="flex items-start gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium text-slate-800">{label}</span>
          <span className={`block truncate text-xs ${value ? "font-medium text-blue-700" : "text-slate-400"}`}>{value || hint || "Not set"}</span>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {shown.map((option) => {
          const selected = value === option;
          return (
            <button key={option} type="button" aria-pressed={selected} onClick={() => onChange(selected ? "" : option)} className={chipClass(selected)}>
              {field === "color" && SWATCHES[option] && (
                <span className="size-3 shrink-0 rounded-full ring-1 ring-black/10" style={{ backgroundColor: SWATCHES[option] }} aria-hidden="true" />
              )}
              {option}
              {selected && <LuCheck className="size-3.5" aria-hidden="true" />}
            </button>
          );
        })}
        <span className="inline-flex h-8 items-center rounded-lg border border-dashed border-slate-300 bg-white transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
          <input
            aria-label={`Other ${label.toLowerCase()}`}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder={placeholder}
            maxLength={40}
            className="w-24 bg-transparent pl-3 text-xs text-slate-800 outline-none placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={add}
            aria-label={`Add ${label.toLowerCase()}`}
            className="mr-1 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <LuPlus className="size-3.5" aria-hidden="true" />
          </button>
        </span>
      </div>
    </fieldset>
  );
};

// Colour, RAM, storage and region, one value each. variant: { color, ram, storage, region }; onChange(next).
const VariantPicker = ({ variant, onChange }) => (
  <div className="divide-y divide-slate-100 rounded-xl bg-white ring-1 ring-slate-200">
    {Object.keys(VARIANT_CHOICES).map((field) => (
      <Attribute key={field} field={field} value={variant[field] ?? ""} onChange={(value) => onChange({ ...variant, [field]: value })} />
    ))}
  </div>
);

export default VariantPicker;
