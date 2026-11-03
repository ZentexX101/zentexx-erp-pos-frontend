import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { CATEGORICAL, OTHERS_COLOR } from "../../../constants/chart";
import { percentOf } from "../../../utils/chart";
import { formatTaka, formatTakaShort } from "../../../utils/money";

// Whole taka in the centre (৳1,96,970); only crores are shortened, so the number always fits the hole
const centreAmount = (amount) => (Math.abs(amount) >= 10000000 ? formatTakaShort(amount) : `৳${Math.round(amount).toLocaleString("en-IN")}`);

const colorOf = (row, index) => (row.others ? OTHERS_COLOR : CATEGORICAL[index % CATEGORICAL.length]);

// Revenue by category: the top six as slices plus one "Others" slice (from the backend), so the
// donut and its legend stay the same size however many categories there are.
// Hovering a slice or a legend row shows that category in the donut's centre (no floating tooltip
// to cover the chart) and fades the other slices. Narrow cards stack the legend under the donut.
const CategoryDonut = ({ rows, total }) => {
  const [active, setActive] = useState(null);
  const current = active === null ? null : rows[active];

  return (
    <div className="@container">
      <div className="grid items-center gap-5 @md:grid-cols-[180px_minmax(0,1fr)]">
        <div className="relative mx-auto h-[180px] w-[180px]" onMouseLeave={() => setActive(null)}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={rows}
                dataKey="amount"
                nameKey="name"
                innerRadius="70%"
                outerRadius="100%"
                paddingAngle={rows.length > 1 ? 3 : 0}
                cornerRadius={6}
                stroke="none"
                isAnimationActive={false}
                onMouseEnter={(_, index) => setActive(index)}
              >
                {rows.map((row, index) => (
                  <Cell
                    key={row.name}
                    fill={colorOf(row, index)}
                    fillOpacity={active === null || active === index ? 1 : 0.25}
                    className="cursor-pointer transition-[fill-opacity] duration-200"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centre: the hovered category, or the total */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <span className="w-full truncate text-[11px] font-medium uppercase tracking-wide text-slate-500">{current ? current.name : "Total"}</span>
            <span className="text-base font-bold tabular-nums text-slate-900" title={formatTaka(current ? current.amount : total)}>
              {centreAmount(current ? current.amount : total)}
            </span>
            {current && <span className="text-xs tabular-nums text-slate-500">{percentOf(current.amount, total)}%</span>}
          </div>
        </div>

        <ul className="min-w-0 space-y-0.5" onMouseLeave={() => setActive(null)}>
          {rows.map((row, index) => (
            <li
              key={row.name}
              onMouseEnter={() => setActive(index)}
              className={`flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition ${active === index ? "bg-slate-100" : ""} ${
                active !== null && active !== index ? "opacity-50" : ""
              }`}
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: colorOf(row, index) }} aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-slate-700" title={row.name}>
                {row.name}
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-slate-900">{formatTaka(row.amount)}</span>
              <span className="w-10 shrink-0 text-right text-xs tabular-nums text-slate-400">{percentOf(row.amount, total)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CategoryDonut;
