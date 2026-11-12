import { percentOf } from "../../../utils/chart";
import { formatTaka } from "../../../utils/money";

// A ranked list with a thin bar per row (top products, payment methods, expense categories...).
// rows: [{ key, label, value, sub }]; bars are scaled to the biggest value. color: the measure's colour.
const RankedList = ({ rows, color, formatValue = formatTaka }) => {
  const top = Math.max(...rows.map((row) => row.value), 0);
  return (
    <ol className="space-y-3">
      {rows.map((row, index) => (
        <li key={row.key ?? row.label} className="min-w-0">
          <div className="flex min-w-0 items-baseline gap-2 text-sm">
            <span className="w-4 shrink-0 text-xs tabular-nums text-slate-400">{index + 1}</span>
            <span className="min-w-0 flex-1 truncate font-medium text-slate-800" title={row.label}>
              {row.label}
            </span>
            <span className="shrink-0 font-semibold tabular-nums text-slate-900">{formatValue(row.value)}</span>
          </div>
          <div className="ml-6 mt-1 flex items-center gap-2">
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <span className="block h-full rounded-full" style={{ width: `${percentOf(row.value, top)}%`, backgroundColor: color }} />
            </span>
            {row.sub && <span className="shrink-0 text-[11px] text-slate-500">{row.sub}</span>}
          </div>
        </li>
      ))}
    </ol>
  );
};

export default RankedList;
