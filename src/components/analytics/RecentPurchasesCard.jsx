import { LuShoppingBag } from "react-icons/lu";
import { ROUTES } from "../../constants/routes";
import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import ChartCard from "./ui/ChartCard";
import MiniTable from "./ui/MiniTable";
import ViewAllLink from "./ui/ViewAllLink";

// The latest purchases of the period. showBranch: the all-branch view adds the branch.
const RecentPurchasesCard = ({ purchases, inBranch, showBranch }) => {
  const columns = [
    { key: "invoiceNo", header: "Invoice", render: (row) => <span className="font-mono text-xs font-semibold text-slate-900">{row.invoiceNo}</span> },
    { key: "supplier", header: "Supplier", render: (row) => row.supplier?.name ?? "—" },
    ...(showBranch ? [{ key: "branch", header: "Branch", className: "text-slate-600", render: (row) => row.branch?.name ?? "—" }] : []),
    { key: "date", header: "Date", className: "whitespace-nowrap text-slate-500", render: (row) => formatDateTime(row.date) },
    {
      key: "total",
      header: "Total",
      className: "text-right whitespace-nowrap",
      render: (row) => (
        <span>
          <span className="font-semibold text-slate-900">{formatTaka(row.totalAmount)}</span>
          {row.dueAmount > 0 && <span className="block text-[11px] text-red-600">Due {formatTaka(row.dueAmount)}</span>}
        </span>
      ),
    },
  ];

  return (
    <ChartCard icon={LuShoppingBag} title="Recent Purchases" action={<ViewAllLink to={inBranch && ROUTES.BRANCH_PURCHASES} />}>
      <MiniTable rows={purchases} columns={columns} emptyText="No purchases in this period." />
    </ChartCard>
  );
};

export default RecentPurchasesCard;
