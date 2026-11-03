import { LuTrophy } from "react-icons/lu";
import { SERIES_COLORS } from "../../constants/chart";
import { formatTaka } from "../../utils/money";
import ChartCard from "./ui/ChartCard";
import RankedList from "./ui/RankedList";

// Best sellers by amount. showMoney adds each product's profit (main admins).
const TopProductsCard = ({ products, showMoney }) => (
  <ChartCard icon={LuTrophy} title="Top Products" subtitle="By sales amount, after discount and returns" empty={!products.length}>
    <RankedList
      color={SERIES_COLORS.sales}
      rows={products.map((row) => ({
        label: row.name,
        value: row.amount,
        sub: showMoney ? `${row.quantity} pcs · profit ${formatTaka(row.profit)}` : `${row.quantity} pcs`,
      }))}
    />
  </ChartCard>
);

export default TopProductsCard;
