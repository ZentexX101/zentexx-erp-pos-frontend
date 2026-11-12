import { formatTaka } from "../../../utils/money";

// Shared Recharts tooltip: the hovered label and each series' value, ink in text colours,
// a colour dot for identity. labelFormatter turns the raw x value into text; accent tints the border.
const ChartTooltip = ({ active, payload, label, labelFormatter = (value) => value, valueFormatter = formatTaka, accent }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="min-w-40 rounded-xl border bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm"
      style={{ borderColor: accent ? `${accent}66` : "#e2e8f0" }}
    >
      <p className="mb-1 font-semibold text-slate-900">{labelFormatter(label)}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey ?? entry.name} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color ?? entry.payload?.fill }} aria-hidden="true" />
            {entry.name}
          </span>
          <span className="font-semibold tabular-nums text-slate-900">{valueFormatter(entry.value)}</span>
        </p>
      ))}
    </div>
  );
};

export default ChartTooltip;
