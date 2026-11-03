import { useId, useState } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_COLOR, SERIES_COLORS } from "../../../constants/chart";
import { bucketLabel } from "../../../utils/chart";
import { formatTaka, formatTakaShort } from "../../../utils/money";
import ChartTooltip from "./ChartTooltip";

const SERIES = [
  { key: "sales", name: "Sales" },
  { key: "purchases", name: "Purchases" },
  { key: "expenses", name: "Expenses" },
];

// Full-height dashed hairline that follows the pointer
const Crosshair = ({ points, height, top }) =>
  points?.[0] ? <line x1={points[0].x} x2={points[0].x} y1={top} y2={top + height} stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 4" /> : null;

// Total, average per bucket, best bucket and how many buckets had any amount
const statsOf = (data, key) => {
  const total = data.reduce((sum, row) => sum + row[key], 0);
  const best = data.reduce((top, row) => (row[key] > (top?.[key] ?? 0) ? row : top), null);
  return { total, average: data.length ? total / data.length : 0, best, active: data.filter((row) => row[key] > 0).length };
};

// One small figure in the strip under the chart
const Stat = ({ label, value, hint }) => (
  <div className="min-w-0 px-4 py-3">
    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-0.5 truncate text-sm font-bold tabular-nums text-slate-900" title={typeof value === "string" ? value : undefined}>
      {value}
    </p>
    {hint && <p className="truncate text-xs text-slate-500">{hint}</p>}
  </div>
);

// Sales, purchases and expenses per day / month (unit), as smooth bold lines (dots only on hover).
// The three metric cards pick one measure:
// a gradient area with its average line and best point marked. "Compare" (the default) lays all three
// over each other. The strip under the chart sums up the picked measure (sales while comparing).
const TrendChart = ({ data, unit = "day" }) => {
  const [metric, setMetric] = useState("all");
  const id = useId().replace(/:/g, "");
  const compare = metric === "all";
  const shown = compare ? SERIES : SERIES.filter(({ key }) => key === metric);
  const stats = Object.fromEntries(SERIES.map(({ key }) => [key, statsOf(data, key)]));
  const focus = compare ? "sales" : metric;
  const focusStats = stats[focus];
  const per = unit === "month" ? "month" : "day";

  return (
    <div className="space-y-4">
      {/* Metric cards + Compare */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="grid min-w-0 flex-1 grid-cols-3 gap-2" role="tablist" aria-label="Measure">
          {SERIES.map(({ key, name }) => {
            const active = metric === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMetric(active ? "all" : key)}
                className={`group relative min-w-0 overflow-hidden rounded-xl border px-3 py-2.5 text-left transition ${
                  active ? "border-slate-300 bg-white shadow-sm" : "border-slate-200/80 bg-slate-50/60 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <span
                  className={`absolute inset-x-0 top-0 h-[3px] transition-opacity ${active || compare ? "opacity-100" : "opacity-30 group-hover:opacity-70"}`}
                  style={{ backgroundColor: SERIES_COLORS[key] }}
                  aria-hidden="true"
                />
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: SERIES_COLORS[key] }} aria-hidden="true" />
                  <span className="truncate">{name}</span>
                </span>
                <span className="mt-1 block truncate text-sm font-bold tabular-nums text-slate-900 sm:text-base" title={formatTaka(stats[key].total)}>
                  {formatTaka(stats[key].total)}
                </span>
                <span className="hidden truncate text-[11px] tabular-nums text-slate-500 sm:block">
                  Avg {formatTakaShort(stats[key].average)} / {per}
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          role="tab"
          aria-selected={compare}
          onClick={() => setMetric("all")}
          className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
            compare
              ? "border-slate-300 bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
              : "border-slate-200/80 bg-slate-50/60 text-slate-500 hover:border-slate-300 hover:bg-white hover:text-slate-900"
          }`}
        >
          <span className={`flex -space-x-1 transition-opacity ${compare ? "" : "opacity-60"}`} aria-hidden="true">
            {SERIES.map(({ key }) => (
              <span key={key} className="h-2.5 w-2.5 rounded-full ring-2 ring-white" style={{ backgroundColor: SERIES_COLORS[key] }} />
            ))}
          </span>
          Compare
        </button>
      </div>

      {/* Chart */}
      <div className="h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 24, right: 16, bottom: 0, left: 0 }}>
            <defs>
              {SERIES.map(({ key }) => (
                <linearGradient key={key} id={`${id}-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={SERIES_COLORS[key]} stopOpacity={compare ? 0.16 : 0.42} />
                  <stop offset="100%" stopColor={SERIES_COLORS[key]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="#e9eef4" strokeDasharray="4 6" vertical={false} />
            <XAxis
              dataKey="label"
              tickFormatter={bucketLabel}
              tick={{ fontSize: 11, fill: AXIS_COLOR }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tickMargin={10}
              minTickGap={28}
              padding={{ left: 8, right: 8 }}
            />
            <YAxis tickFormatter={formatTakaShort} tick={{ fontSize: 11, fill: AXIS_COLOR }} tickLine={false} axisLine={false} width={52} />
            <Tooltip
              content={<ChartTooltip labelFormatter={bucketLabel} accent={compare ? undefined : SERIES_COLORS[metric]} />}
              cursor={<Crosshair />}
              // Always Sales, Purchases, Expenses in the tooltip
              itemSorter={(item) => SERIES.findIndex(({ key }) => key === item.dataKey)}
            />

            {/* One measure: its average as a dashed line */}
            {!compare && focusStats.average > 0 && (
              <ReferenceLine
                y={focusStats.average}
                stroke={SERIES_COLORS[focus]}
                strokeOpacity={0.6}
                strokeDasharray="6 6"
                label={{ value: `Avg ${formatTakaShort(focusStats.average)}`, position: "insideTopLeft", fill: AXIS_COLOR, fontSize: 11, fontWeight: 600 }}
              />
            )}

            {shown.map(({ key, name }) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={name}
                stroke={SERIES_COLORS[key]}
                className={`chart-glow-${key}`}
                strokeWidth={compare ? 3 : 3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={`url(#${id}-${key})`}
                dot={false}
                activeDot={{ r: 6, fill: "#fff", stroke: SERIES_COLORS[key], strokeWidth: 3 }}
                animationDuration={600}
              />
            ))}

            {/* One measure: its best day / month marked */}
            {!compare && focusStats.best && (
              <ReferenceDot
                x={focusStats.best.label}
                y={focusStats.best[focus]}
                r={7}
                fill={SERIES_COLORS[focus]}
                stroke="#fff"
                strokeWidth={3}
                label={{
                  value: `Best ${formatTakaShort(focusStats.best[focus])}`,
                  position: "top",
                  offset: 12,
                  fill: "#0f172a",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary of the picked measure */}
      <div className="grid grid-cols-2 divide-slate-200 rounded-xl bg-slate-50 sm:grid-cols-4 sm:divide-x">
        <Stat label={`${SERIES.find((s) => s.key === focus).name} total`} value={formatTaka(focusStats.total)} />
        <Stat label={`Average / ${per}`} value={formatTaka(focusStats.average)} />
        <Stat
          label={`Best ${per}`}
          value={focusStats.best ? formatTaka(focusStats.best[focus]) : "—"}
          hint={focusStats.best ? bucketLabel(focusStats.best.label) : undefined}
        />
        <Stat label={`Active ${per}s`} value={`${focusStats.active} of ${data.length}`} />
      </div>
    </div>
  );
};

export default TrendChart;
