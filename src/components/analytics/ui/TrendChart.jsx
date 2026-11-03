import { useId, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_COLOR, SERIES_COLORS } from "../../../constants/chart";
import { bucketLabel } from "../../../utils/chart";
import { formatTaka, formatTakaShort } from "../../../utils/money";
import ChartTooltip from "./ChartTooltip";

const SERIES = [
  { key: "sales", name: "Sales" },
  { key: "purchases", name: "Purchases" },
  { key: "expenses", name: "Expenses" },
];

// Full-height hairline that follows the pointer
const Crosshair = ({ points, height, top }) => (points?.[0] ? <line x1={points[0].x} x2={points[0].x} y1={top} y2={top + height} stroke="#94a3b8" strokeWidth={1} /> : null);

// Sales, purchases or expenses per day / month as one soft gradient area (the clearest read),
// or all three as light areas on "Compare" (the default). The tabs double as the legend with each period total.
const TrendChart = ({ data }) => {
  const [metric, setMetric] = useState("all"); // "Compare" first: all three at a glance
  const id = useId().replace(/:/g, "");
  const totals = Object.fromEntries(SERIES.map(({ key }) => [key, data.reduce((sum, row) => sum + row[key], 0)]));
  const compare = metric === "all";
  const shown = compare ? SERIES : SERIES.filter(({ key }) => key === metric);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Trend">
        {[...SERIES, { key: "all", name: "Compare" }].map(({ key, name }) => {
          const active = metric === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMetric(key)}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs transition ${
                active ? "bg-slate-900 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {key !== "all" && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SERIES_COLORS[key] }} aria-hidden="true" />}
              {name}
              {key !== "all" && <span className={`font-semibold tabular-nums ${active ? "text-white" : "text-slate-900"}`}>{formatTaka(totals[key])}</span>}
            </button>
          );
        })}
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 16, bottom: 0, left: 0 }}>
            <defs>
              {SERIES.map(({ key }) => (
                <linearGradient key={key} id={`${id}-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={SERIES_COLORS[key]} stopOpacity={compare ? 0.12 : 0.45} />
                  <stop offset="95%" stopColor={SERIES_COLORS[key]} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="#eef2f6" vertical={false} />
            <XAxis
              dataKey="label"
              tickFormatter={bucketLabel}
              tick={{ fontSize: 11, fill: AXIS_COLOR }}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={28}
              padding={{ left: 4, right: 4 }}
            />
            <YAxis tickFormatter={formatTakaShort} tick={{ fontSize: 11, fill: AXIS_COLOR }} tickLine={false} axisLine={false} width={52} />
            <Tooltip
              content={<ChartTooltip labelFormatter={bucketLabel} accent={compare ? undefined : SERIES_COLORS[metric]} />}
              cursor={<Crosshair />}
            />
            {shown.map(({ key, name }) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={name}
                stroke={SERIES_COLORS[key]}
                className={`chart-glow-${key}`}
                strokeWidth={compare ? 2.5 : 3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={`url(#${id}-${key})`}
                dot={false}
                activeDot={{ r: 6, fill: "#fff", stroke: SERIES_COLORS[key], strokeWidth: 3 }}
                animationDuration={600}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;
