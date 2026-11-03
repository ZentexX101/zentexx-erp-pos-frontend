import { LuReceipt } from "react-icons/lu";
import { SERIES_COLORS } from "../../constants/chart";
import { categoryLabel } from "../../constants/expense";
import ChartCard from "./ui/ChartCard";
import RankedList from "./ui/RankedList";

// Where the money went: expense total per category
const ExpenseCategoryCard = ({ categories }) => (
  <ChartCard icon={LuReceipt} title="Expenses by Category" subtitle="Where the money went" empty={!categories.length}>
    <RankedList color={SERIES_COLORS.expenses} rows={categories.map((row) => ({ key: row.category, label: categoryLabel(row.category), value: row.amount }))} />
  </ChartCard>
);

export default ExpenseCategoryCard;
