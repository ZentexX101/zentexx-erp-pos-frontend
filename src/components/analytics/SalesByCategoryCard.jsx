import { LuChartPie } from "react-icons/lu";
import CategoryDonut from "./ui/CategoryDonut";
import ChartCard from "./ui/ChartCard";

// Revenue by category: top six plus "Others" (grouped on the backend, so it never overflows)
const SalesByCategoryCard = ({ categories }) => (
  <ChartCard icon={LuChartPie} title="Sales by Category" subtitle="After discount and returns · top 6, the rest grouped" empty={!categories.rows.length}>
    <CategoryDonut rows={categories.rows} total={categories.total} />
  </ChartCard>
);

export default SalesByCategoryCard;
