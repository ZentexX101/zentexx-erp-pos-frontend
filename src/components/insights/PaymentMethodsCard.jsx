import { LuCreditCard } from "react-icons/lu";
import { SERIES_COLORS } from "../../constants/chart";
import ChartCard from "./ui/ChartCard";
import RankedList from "./ui/RankedList";

// How customers paid: amount and number of payments per method
const PaymentMethodsCard = ({ methods }) => (
  <ChartCard icon={LuCreditCard} title="Payment Methods" subtitle="How customers paid at billing" empty={!methods.length}>
    <RankedList color={SERIES_COLORS.profit} rows={methods.map((row) => ({ label: row.name, value: row.amount, sub: `${row.count}×` }))} />
  </ChartCard>
);

export default PaymentMethodsCard;
