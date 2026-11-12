import { LuChartLine } from "react-icons/lu";
import ChartCard from "./ui/ChartCard";
import TrendChart from "./ui/TrendChart";

// Sales, purchases and expenses over the period (per day, or per month for long periods).
// allTime: the chart only covers the last 12 months, so the subtitle says so.
const SalesTrendCard = ({ trend, unit, allTime }) => (
  <ChartCard
    icon={LuChartLine}
    title="Sales Trend"
    subtitle={`Sales, purchases and expenses per ${unit}${allTime ? " · last 12 months" : ""}`}
    empty={trend.every((row) => !row.sales && !row.purchases && !row.expenses)}
  >
    <TrendChart data={trend} unit={unit} />
  </ChartCard>
);

export default SalesTrendCard;
