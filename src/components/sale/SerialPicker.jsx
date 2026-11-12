import { useState } from "react";
import { LuChevronDown, LuX } from "react-icons/lu";
import { useStockSerialsData } from "../../hooks/useStockApi";
import Spinner from "../common/loaders/Spinner";

// Pick IMEIs from this branch's stock for one cart line: the picked ones as chips, and a tick list
const SerialPicker = ({ productId, selected, onChange }) => {
  const [open, setOpen] = useState(selected.length === 0);
  const { data: units = [], isLoading } = useStockSerialsData(productId, undefined, { enabled: open });
  const picked = new Set(selected);
  const toggle = (serial) => onChange(picked.has(serial) ? selected.filter((s) => s !== serial) : [...selected, serial]);

  return (
    <div className="min-w-0 space-y-1.5">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((serial) => (
            <span key={serial} className="inline-flex items-center gap-1 rounded-md bg-violet-50 py-0.5 pl-1.5 pr-0.5 font-mono text-[11px] text-violet-700 ring-1 ring-violet-200">
              {serial}
              <button type="button" onClick={() => toggle(serial)} className="rounded p-0.5 hover:bg-violet-100" aria-label={`Remove ${serial}`}>
                <LuX className="size-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
      >
        {selected.length ? "Pick more IMEIs" : "Pick IMEI"}
        <LuChevronDown className={`size-3.5 transition ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <div className="max-h-36 overflow-y-auto rounded-lg bg-slate-50 p-1.5 ring-1 ring-slate-200">
          {isLoading ? (
            <Spinner className="m-1 h-4 w-4 text-indigo-600" />
          ) : units.length === 0 ? (
            <p className="p-1 text-xs text-slate-500">No IMEI in stock.</p>
          ) : (
            units.map((unit) => (
              <label key={unit._id} className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-xs hover:bg-white">
                <input type="checkbox" checked={picked.has(unit.serial)} onChange={() => toggle(unit.serial)} className="rounded border-slate-300" />
                <span className="font-mono text-slate-700">{unit.serial}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SerialPicker;
