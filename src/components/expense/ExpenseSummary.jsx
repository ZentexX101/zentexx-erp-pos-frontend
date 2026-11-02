import { useState } from "react";
import { LuX } from "react-icons/lu";
import { categoryLabel } from "../../constants/expense";
import { formatTaka } from "../../utils/money";

// One fixed colour per category, so a category looks the same in every period
const COLORS = {
  rent: "bg-rose-500",
  utility: "bg-amber-500",
  salary: "bg-indigo-500",
  transport: "bg-sky-500",
  food: "bg-orange-400",
  courier: "bg-teal-500",
  marketing: "bg-fuchsia-500",
  maintenance: "bg-lime-500",
  tax: "bg-slate-600",
  product: "bg-purple-500",
  other: "bg-slate-400",
};

const percent = (amount, total) => (total ? Math.round((amount / total) * 100) : 0);

// Chips shown before "+N more": the biggest categories (the bar always shows them all)
const VISIBLE_CHIPS = 4;

// Total spent in the period, one bar split by category, and chips for the biggest categories
// (click a chip to filter by it, click again to clear; "+N more" shows the rest)
const ExpenseSummary = ({ summary, activeCategory, onCategory }) => {
  const [showAll, setShowAll] = useState(false);
  if (!summary) return null;
  const { total, count, byCategory } = summary;

  // The filtered category always stays visible, even when it is a small one
  const chips = showAll
    ? byCategory
    : byCategory.filter((row, index) => index < VISIBLE_CHIPS || row.category === activeCategory);
  const hidden = byCategory.length - chips.length;

  return (
    <section className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center">
      <div className="shrink-0 sm:w-48 sm:border-r sm:border-slate-200 sm:pr-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Expense</p>
        <p className="text-2xl font-bold text-red-600">{formatTaka(total)}</p>
        <p className="text-xs text-slate-500">
          {count} expense{count === 1 ? "" : "s"}
          {activeCategory ? ` in ${categoryLabel(activeCategory)}` : ` · ${byCategory.length} categor${byCategory.length === 1 ? "y" : "ies"}`}
        </p>
      </div>

      {byCategory.length === 0 ? (
        <p className="text-sm text-slate-500">No expenses in this period.</p>
      ) : (
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex h-3 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
            {byCategory.map((row) => (
              <span
                key={row.category}
                className={`${COLORS[row.category] ?? COLORS.other} ${activeCategory && activeCategory !== row.category ? "opacity-25" : ""} transition-opacity`}
                style={{ width: `${(row.amount / total) * 100}%` }}
                title={`${categoryLabel(row.category)}: ${formatTaka(row.amount)}`}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {chips.map((row) => {
              const active = activeCategory === row.category;
              return (
                <button
                  key={row.category}
                  type="button"
                  onClick={() => onCategory(active ? "" : row.category)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition ${
                    active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${COLORS[row.category] ?? COLORS.other}`} aria-hidden="true" />
                  <span>{categoryLabel(row.category)}</span>
                  <span className="font-semibold">{formatTaka(row.amount)}</span>
                  <span className={active ? "text-white/70" : "text-slate-400"}>{percent(row.amount, total)}%</span>
                  {active && <LuX className="h-3 w-3" aria-hidden="true" />}
                </button>
              );
            })}
            {(hidden > 0 || showAll) && byCategory.length > VISIBLE_CHIPS && (
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
              >
                {showAll ? "Show less" : `+${hidden} more`}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default ExpenseSummary;
