import { useState } from "react";
import { LuCheck, LuPlus, LuShieldCheck, LuX } from "react-icons/lu";
import { formatTaka } from "../../utils/money";
import { cartLineQuantity, cartServicePrice } from "../../utils/sale";
import { servicePrice } from "../../utils/serviceSale";

// Services sold with one cart line (warranty, coverage...). Each covers every piece of the line and is
// priced from its selling price. The picked ones are listed; "Add service" opens a tick list right here
// in the line (nothing floats over the cart). options: active services; onChange(next list of picked options);
// onCreate (only for users who may create services): opens the new-service form, the saved service gets picked
const LineServices = ({ line, options, onChange, onCreate }) => {
  const [open, setOpen] = useState(false);
  const picked = line.services ?? [];
  const pickedIds = new Set(picked.map((service) => service._id));
  const pieces = cartLineQuantity(line);
  const unitPrice = Number(line.unitPrice) || 0;

  const toggle = (service) =>
    onChange(
      pickedIds.has(service._id)
        ? picked.filter((s) => s._id !== service._id)
        : [...picked, service],
    );

  // The price shown for a service: for all pieces, or per piece while none is picked yet
  const priceOf = (service) =>
    pieces > 0
      ? formatTaka(cartServicePrice(line, service))
      : `${formatTaka(servicePrice(unitPrice, service.pricePercent))} each`;

  if (!options.length && !picked.length && !onCreate) return null;

  return (
    <div className="mt-3 space-y-2">
      {/* While the tick list is open it shows what's picked, so the summary hides */}
      {picked.length > 0 && !open && (
        <ul className="divide-y divide-emerald-100 rounded-lg bg-emerald-50/60 ring-1 ring-emerald-100">
          {picked.map((service) => (
            <li
              key={service._id}
              className="flex items-start gap-2 px-2.5 py-2"
            >
              <LuShieldCheck
                className="mt-0.5 size-3.5 shrink-0 text-emerald-600"
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span className="block break-words text-xs font-medium leading-snug text-slate-800">
                  {service.name}
                </span>
                <span className="block text-[11px] text-slate-500">
                  {service.pricePercent}% of the price
                  {pieces > 1 ? ` · ${pieces} pcs` : ""}
                </span>
              </span>
              <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-900">
                {priceOf(service)}
              </span>
              <button
                type="button"
                onClick={() => toggle(service)}
                className="-mr-1 shrink-0 rounded p-0.5 text-slate-400 hover:bg-emerald-100 hover:text-red-600"
                aria-label={`Remove ${service.name}`}
              >
                <LuX className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {(options.length > 0 || onCreate) && (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="inline-flex items-center gap-1 rounded text-xs font-semibold text-indigo-600 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
        >
          {open ? (
            "Done"
          ) : (
            <>
              <LuPlus className="size-3.5" aria-hidden="true" />
              {picked.length ? "Add more service" : "Add service"}
            </>
          )}
        </button>
      )}

      {open && (
        <div className="overflow-hidden rounded-lg ring-1 ring-slate-200">
          {options.length === 0 && (
            <p className="px-3 py-3 text-xs text-slate-500">
              No active service yet.
            </p>
          )}
          <ul
            role="listbox"
            aria-label="Services"
            aria-multiselectable="true"
            className="max-h-60 overflow-y-auto"
          >
            {options.map((service) => {
              const active = pickedIds.has(service._id);
              return (
                <li
                  key={service._id}
                  role="option"
                  aria-selected={active}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => toggle(service)}
                    className={`flex w-full items-start gap-2.5 px-2.5 py-2 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 ${active ? "bg-emerald-50/60" : "hover:bg-slate-50"}`}
                  >
                    <span
                      className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border ${
                        active
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                      aria-hidden="true"
                    >
                      {active && <LuCheck className="size-3" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block break-words text-xs font-medium leading-snug text-slate-800">
                        {service.name}
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        {service.pricePercent}% of the price
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-700">
                      {priceOf(service)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {onCreate && (
            <button
              type="button"
              onClick={onCreate}
              className="flex w-full items-center gap-1.5 border-t border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-semibold text-indigo-600 hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
            >
              <LuPlus className="size-3.5" aria-hidden="true" />
              Create new service
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LineServices;
