import { useState } from "react";
import { LuCheck, LuChevronDown, LuSearch, LuX } from "react-icons/lu";
import { useStockSerialsData } from "../../hooks/useStockApi";
import Spinner from "../common/loaders/Spinner";

// Pick IMEIs from this branch's stock for one cart line: the picked ones as chips, and one panel with a
// search box over the tick list. Enter in the box ticks the IMEI typed / scanned in full, or the only match.
const SerialPicker = ({ productId, selected, onChange }) => {
  const [open, setOpen] = useState(selected.length === 0);
  const [filter, setFilter] = useState("");
  const { data: units = [], isLoading } = useStockSerialsData(productId, undefined, { enabled: open });
  const picked = new Set(selected);
  const toggle = (serial) => onChange(picked.has(serial) ? selected.filter((s) => s !== serial) : [...selected, serial]);
  const query = filter.trim().toUpperCase();
  const shown = query ? units.filter((unit) => unit.serial.includes(query)) : units;

  const handleSearchKey = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault(); // a scanner sends Enter; it mustn't submit anything
    const match = units.find((unit) => unit.serial === query) ?? (shown.length === 1 ? shown[0] : null);
    if (!match) return;
    if (!picked.has(match.serial)) onChange([...selected, match.serial]);
    setFilter("");
  };

  return (
    <div className="min-w-0 space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((serial) => (
            <span
              key={serial}
              className="inline-flex items-center gap-1 rounded-md bg-violet-50 py-0.5 pl-1.5 pr-0.5 font-mono text-[11px] text-violet-700 ring-1 ring-violet-200"
            >
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
        <div className="overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
          {units.length > 0 && (
            <div className="relative border-b border-slate-100">
              <LuSearch className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                onKeyDown={handleSearchKey}
                placeholder="Search or scan IMEI..."
                aria-label="Search IMEI"
                autoComplete="off"
                spellCheck={false}
                className="h-9 w-full bg-transparent pl-8 pr-8 font-mono text-xs text-slate-800 outline-none placeholder:font-sans placeholder:text-slate-400 focus:bg-slate-50/60"
              />
              {filter && (
                <button
                  type="button"
                  onClick={() => setFilter("")}
                  aria-label="Clear IMEI search"
                  className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <LuX className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          )}

          <div className="max-h-44 overflow-y-auto p-1">
            {isLoading ? (
              <div className="flex justify-center py-3">
                <Spinner className="h-4 w-4 text-indigo-600" />
              </div>
            ) : units.length === 0 ? (
              <p className="px-2 py-2 text-xs text-slate-500">No IMEI in stock.</p>
            ) : shown.length === 0 ? (
              <p className="px-2 py-2 text-xs text-slate-500">No IMEI matches &ldquo;{filter.trim()}&rdquo;.</p>
            ) : (
              shown.map((unit) => {
                const on = picked.has(unit.serial);
                return (
                  <label
                    key={unit._id}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-xs transition-colors ${
                      on ? "bg-violet-50 text-violet-800" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <input type="checkbox" checked={on} onChange={() => toggle(unit.serial)} className="peer sr-only" />
                    <span
                      className={`flex size-4 shrink-0 items-center justify-center rounded border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-violet-300 ${
                        on ? "border-violet-600 bg-violet-600 text-white" : "border-slate-300 bg-white"
                      }`}
                      aria-hidden="true"
                    >
                      {on && <LuCheck className="size-3" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 truncate font-mono">{unit.serial}</span>
                  </label>
                );
              })
            )}
          </div>

          {units.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-2.5 py-1.5 text-[11px] text-slate-500">
              <span>{query ? `${shown.length} of ${units.length} shown` : `${units.length} in stock`}</span>
              <span className={selected.length ? "font-semibold text-violet-700" : ""}>{selected.length} picked</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SerialPicker;
