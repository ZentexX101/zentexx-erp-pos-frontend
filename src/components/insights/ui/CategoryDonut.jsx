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
// Each legend row has a share bar in its colour. Hovering a slice or a row shows that category in the
// donut's centre (no floating tooltip to cover the chart) and fades the rest.
// Narrow cards stack the legend under the donut. A footer sums up pieces sold and the top category.
const CategoryDonut = ({ rows, total }) => {
  const [active, setActive] = useState(null);
  const current = active === null ? null : rows[active];
  const pieces = rows.reduce((sum, row) => sum + row.quantity, 0);
  const top = rows.find((row) => !row.others) ?? rows[0];
  const faded = (index) => active !== null && active !== index;

  return (
    <div className="@container flex h-full flex-col">
      <div className="grid flex-1 content-center items-center gap-6 py-2 @md:grid-cols-[200px_minmax(0,1fr)]">
        <div className="relative mx-auto h-[200px] w-[200px]" onMouseLeave={() => setActive(null)}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={rows}
                dataKey="amount"
                nameKey="name"
                innerRadius="72%"
                outerRadius="100%"
                paddingAngle={rows.length > 1 ? 3 : 0}
                cornerRadius={8}
                stroke="none"
                isAnimationActive={false}
                onMouseEnter={(_, index) => setActive(index)}
              >
                {rows.map((row, index) => (
                  <Cell
                    key={`${row.name}-${index}`}
                    fill={colorOf(row, index)}
                    fillOpacity={faded(index) ? 0.25 : 1}
                    className="cursor-pointer transition-[fill-opacity] duration-200"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centre: the hovered category, or the total */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <span className="w-full truncate text-[11px] font-semibold uppercase tracking-wider text-slate-500">{current ? current.name : "Total"}</span>
            <span className="mt-0.5 text-lg font-bold tabular-nums text-slate-900" title={formatTaka(current ? current.amount : total)}>
              {centreAmount(current ? current.amount : total)}
            </span>
            <span className="text-xs tabular-nums text-slate-500">
              {current ? `${percentOf(current.amount, total)}% · ${current.quantity} pcs` : `${pieces.toLocaleString("en-IN")} pcs sold`}
            </span>
          </div>
        </div>

        <ul className="min-w-0 space-y-1" onMouseLeave={() => setActive(null)}>
          {rows.map((row, index) => {
            const color = colorOf(row, index);
            const share = percentOf(row.amount, total);
            return (
              <li
                key={`${row.name}-${index}`}
                onMouseEnter={() => setActive(index)}
                className={`rounded-xl px-3 py-2 transition ${active === index ? "bg-slate-50 ring-1 ring-slate-200" : ""} ${faded(index) ? "opacity-50" : ""}`}
              >
                <div className="flex min-w-0 items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate font-medium text-slate-700" title={row.name}>
                    {row.name}
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-slate-900">{formatTaka(row.amount)}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-2 pl-[18px]">
                  <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full" style={{ width: `${Math.max(share, 2)}%`, backgroundColor: color }} />
                  </div>
                  <span className="shrink-0 text-right text-xs tabular-nums text-slate-500">
                    {share}% · {row.quantity} pcs
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Summary */}
      <div className="mt-4 grid grid-cols-2 divide-x divide-slate-200 rounded-xl bg-slate-50 text-center">
        <div className="min-w-0 px-3 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Pieces sold</p>
          <p className="mt-0.5 truncate text-sm font-bold tabular-nums text-slate-900">{pieces.toLocaleString("en-IN")}</p>
        </div>
        <div className="min-w-0 px-3 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Top category</p>
          <p className="mt-0.5 truncate text-sm font-bold text-slate-900" title={top?.name}>
            {top ? `${top.name} · ${percentOf(top.amount, total)}%` : "—"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CategoryDonut;
