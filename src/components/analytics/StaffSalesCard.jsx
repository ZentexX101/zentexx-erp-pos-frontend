import { LuUsers } from "react-icons/lu";
import { formatTaka } from "../../utils/money";
import ChartCard from "./ui/ChartCard";
import MiniTable from "./ui/MiniTable";

const COLUMNS = [
  { key: "name", header: "Staff", render: (row) => <span className="font-medium text-slate-900">{row.name}</span> },
  { key: "count", header: "Orders", className: "text-right", render: (row) => row.count },
  { key: "amount", header: "Sales", className: "text-right font-semibold", render: (row) => formatTaka(row.amount) },
  { key: "incentive", header: "Incentive", className: "text-right text-amber-700", render: (row) => formatTaka(row.incentive) },
];

// Who sold the most: orders, sales and the incentive they earned
const StaffSalesCard = ({ staff }) => (
  <ChartCard icon={LuUsers} title="Staff Sales" subtitle="Orders, sales and incentive per staff" empty={!staff.length}>
    <MiniTable rowKey="name" rows={staff} columns={COLUMNS} />
  </ChartCard>
);

export default StaffSalesCard;
