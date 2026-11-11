import { useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import { FLOW_LABELS } from "../../constants/report";
import { percentOf } from "../../utils/chart";
import { formatTaka } from "../../utils/money";

const TONES = {
  in: { accent: "bg-emerald-500", text: "text-emerald-700", total: "bg-emerald-50 text-emerald-800" },
  out: { accent: "bg-red-500", text: "text-red-700", total: "bg-red-50 text-red-800" },
};

// Money in or out, one row per source, biggest first, each with its share of the total.
// A row opens to show the payment methods it went through (always open on paper).
const CashFlowCard = ({ title, tone, rows, total, emptyText }) => {
  const [open, setOpen] = useState(null);
  const colors = TONES[tone];

  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 print:shadow-none">
      <div className={`h-[3px] ${colors.accent}`} aria-hidden="true" />
      <h2 className="border-b border-slate-100 px-4 py-3.5 font-semibold sm:px-5 text-slate-900">{title}</h2>

      {rows.length === 0 ? (
        <p className="flex flex-1 items-center justify-center px-5 py-10 text-sm text-slate-400">{emptyText}</p>
      ) : (
        <ul className="flex-1 divide-y divide-slate-100">
          {rows.map((row) => {
            const expanded = open === row.key;
            return (
              <li key={row.key}>
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : row.key)}
                  aria-expanded={expanded}
                  className="w-full px-4 py-3 text-left sm:px-5 outline-none transition hover:bg-slate-50 focus-visible:bg-slate-50"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <LuChevronDown
                      className={`size-4 shrink-0 text-slate-400 transition-transform print:hidden ${expanded ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{FLOW_LABELS[row.key] ?? row.key}</span>
                    <span className="shrink-0 text-xs tabular-nums text-slate-400">{row.count}×</span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">{formatTaka(row.amount)}</span>
                  </span>
                  <span className="mt-2 block h-1 overflow-hidden rounded-full bg-slate-100 print:hidden">
                    <span className={`block h-full rounded-full ${colors.accent}`} style={{ width: `${Math.max(percentOf(row.amount, total), 2)}%` }} />
                  </span>
                </button>
                <ul className={`bg-slate-50/70 px-4 py-2 pl-10 sm:px-5 sm:pl-11 print:block ${expanded ? "block" : "hidden"}`}>
                  {row.methods.map((method) => (
                    <li key={method.name} className="flex items-center justify-between gap-3 py-1 text-xs">
                      <span className="min-w-0 truncate text-slate-600">{method.name}</span>
                      <span className="shrink-0 font-medium tabular-nums text-slate-800">{formatTaka(method.amount)}</span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      )}

      <div className={`flex items-center justify-between gap-3 px-4 py-3.5 font-semibold sm:px-5 ${colors.total}`}>
        <span>Total</span>
        <span className="tabular-nums">{formatTaka(total)}</span>
      </div>
    </section>
  );
};

export default CashFlowCard;
