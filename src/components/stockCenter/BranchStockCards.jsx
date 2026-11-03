import { LuBuilding2, LuLayers } from "react-icons/lu";
import { formatTaka } from "../../utils/money";

// One card per branch with its pieces and their cost, plus "All branches" first. A bar shows each
// branch's share of all pieces. Clicking a card shows only that branch (again = back to all).
// branches: [{ _id, name, units, value }] for every branch; active: the picked branch id or "".
const BranchStockCards = ({ branches, active, onPick, showValue }) => {
  const allUnits = branches.reduce((sum, b) => sum + b.units, 0);
  const allValue = branches.reduce((sum, b) => sum + b.value, 0);
  const cards = [{ _id: "", name: "All branches", units: allUnits, value: allValue, all: true }, ...branches];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => {
        const selected = active === card._id;
        const share = allUnits ? Math.round((card.units / allUnits) * 100) : 0;
        const Icon = card.all ? LuLayers : LuBuilding2;
        return (
          <button
            key={card._id || "all"}
            type="button"
            onClick={() => onPick(selected && !card.all ? "" : card._id)}
            aria-pressed={selected}
            className={`relative min-w-0 overflow-hidden rounded-2xl p-4 text-left transition ${
              selected ? "bg-slate-50 shadow-sm ring-1 ring-slate-300" : "bg-white shadow-sm ring-1 ring-slate-200/80 hover:shadow-md hover:ring-slate-300"
            }`}
          >
            {/* The picked card: a slim accent along the top instead of a heavy border */}
            {selected && <span className="absolute inset-x-0 top-0 h-[3px] bg-brand" aria-hidden="true" />}
            <span className="flex items-center gap-2">
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-brand text-white" : "bg-slate-100 text-slate-500"}`}
                aria-hidden="true"
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700" title={card.name}>
                {card.name}
              </span>
              {selected && (
                <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 ring-1 ring-slate-200">
                  Showing
                </span>
              )}
            </span>
            <span className="mt-3 block text-2xl font-bold tabular-nums text-slate-900">
              {card.units.toLocaleString("en-IN")}
              <span className="ml-1 text-sm font-medium text-slate-500">pcs</span>
            </span>
            {showValue && <span className="block truncate text-xs tabular-nums text-slate-500">Cost {formatTaka(card.value)}</span>}
            <span className="mt-3 flex items-center gap-2">
              <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                <span className="block h-full rounded-full bg-slate-900" style={{ width: `${card.all ? 100 : share}%` }} />
              </span>
              <span className="w-9 shrink-0 text-right text-[11px] font-semibold tabular-nums text-slate-500">{card.all ? "100%" : `${share}%`}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default BranchStockCards;
