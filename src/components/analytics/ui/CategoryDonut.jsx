import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CATEGORICAL, OTHERS_COLOR } from "../../../constants/chart";
import { percentOf } from "../../../utils/chart";
import { formatTaka, formatTakaShort } from "../../../utils/money";
import ChartTooltip from "./ChartTooltip";

const colorOf = (row, index) => (row.others ? OTHERS_COLOR : CATEGORICAL[index % CATEGORICAL.length]);

// Revenue by category: the top six as slices plus one "Others" slice (from the backend), so the
// donut and its legend stay the same size however many categories there are.
const CategoryDonut = ({ rows, total }) => (
  <div className="grid items-center gap-4 sm:grid-cols-[176px_minmax(0,1fr)]">
    <div className="relative mx-auto h-44 w-44">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={rows}
            dataKey="amount"
            nameKey="name"
            innerRadius="72%"
            outerRadius="100%"
            paddingAngle={rows.length > 1 ? 3 : 0}
            cornerRadius={6}
            stroke="none"
          >
            {rows.map((row, index) => (
              <Cell key={row.name} fill={colorOf(row, index)} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] uppercase tracking-wide text-slate-500">Total</span>
        <span className="text-lg font-bold tabular-nums text-slate-900">{formatTakaShort(total)}</span>
      </div>
    </div>

    <ul className="min-w-0 space-y-1.5">
      {rows.map((row, index) => (
        <li key={row.name} className="flex min-w-0 items-center gap-2 text-sm">
          <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: colorOf(row, index) }} aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate text-slate-700" title={row.name}>
            {row.name}
          </span>
          <span className="shrink-0 font-semibold tabular-nums text-slate-900">{formatTaka(row.amount)}</span>
          <span className="w-9 shrink-0 text-right text-xs tabular-nums text-slate-400">{percentOf(row.amount, total)}%</span>
        </li>
      ))}
    </ul>
  </div>
);

export default CategoryDonut;
