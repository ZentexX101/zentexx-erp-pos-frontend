import { LuChartColumn } from "react-icons/lu";
import BranchComparisonChart from "./ui/BranchComparisonChart";
import ChartCard from "./ui/ChartCard";

// Main admin, all branches: every branch's sales, expenses and profit side by side
const BranchComparisonCard = ({ rows }) => (
  <ChartCard icon={LuChartColumn} title="Branch Comparison" subtitle="Sales, expenses and profit of each branch">
    <BranchComparisonChart rows={rows} />
  </ChartCard>
);

export default BranchComparisonCard;
