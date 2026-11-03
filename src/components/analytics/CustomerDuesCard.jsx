import { LuHourglass } from "react-icons/lu";
import { ROUTES } from "../../constants/routes";
import { formatTaka } from "../../utils/money";
import { formatPhone } from "../../utils/phone";
import ChartCard from "./ui/ChartCard";
import MiniTable from "./ui/MiniTable";
import ViewAllLink from "./ui/ViewAllLink";

const COLUMNS = [
  { key: "name", header: "Customer", render: (row) => <span className="font-medium text-slate-900">{row.name}</span> },
  { key: "phone", header: "Phone", className: "whitespace-nowrap text-slate-500", render: (row) => formatPhone(row.phone) },
  { key: "balance", header: "Due", className: "text-right font-semibold text-red-600", render: (row) => formatTaka(row.balance) },
];

// Who owes the business the most (customers are shared by every branch)
const CustomerDuesCard = ({ customers, inBranch }) => (
  <ChartCard icon={LuHourglass} title="Customer Dues" subtitle="Who owes the most (all branches)" action={<ViewAllLink to={!inBranch && ROUTES.CUSTOMERS} />}>
    <MiniTable rows={customers} columns={COLUMNS} emptyText="No customer owes anything." />
  </ChartCard>
);

export default CustomerDuesCard;
