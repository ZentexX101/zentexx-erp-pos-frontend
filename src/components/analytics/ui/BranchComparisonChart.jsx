import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_COLOR, SERIES_COLORS } from "../../../constants/chart";
import { formatTakaShort } from "../../../utils/money";
import ChartTooltip from "./ChartTooltip";

const SERIES = [
  { key: "sales", name: "Sales" },
  { key: "expenses", name: "Expenses" },
  { key: "profit", name: "Gross Profit" },
];

// Long branch names are shortened on the axis; the tooltip shows them in full
const shortName = (name) => (name.length > 14 ? `${name.slice(0, 13)}…` : name);

// Main admin, all branches: sales, expenses and profit of every branch side by side
const BranchComparisonChart = ({ rows }) => (
  <div className="h-72">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barGap={2} barCategoryGap="24%">
        <CartesianGrid stroke="#eef2f6" vertical={false} />
        <XAxis dataKey="branch" tickFormatter={shortName} tick={{ fontSize: 11, fill: AXIS_COLOR }} tickLine={false} axisLine={false} tickMargin={8} interval={0} />
        <YAxis tickFormatter={formatTakaShort} tick={{ fontSize: 11, fill: AXIS_COLOR }} tickLine={false} axisLine={false} width={56} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc", radius: 8 }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: AXIS_COLOR }} />
        {SERIES.map(({ key, name }) => (
          <Bar key={key} dataKey={key} name={name} fill={SERIES_COLORS[key]} radius={[6, 6, 0, 0]} maxBarSize={32} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default BranchComparisonChart;
