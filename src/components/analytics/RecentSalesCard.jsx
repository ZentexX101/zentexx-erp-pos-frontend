import { LuShoppingCart } from "react-icons/lu";
import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import Badge from "../common/data/Badge";
import ChartCard from "./ui/ChartCard";
import MiniTable from "./ui/MiniTable";
import ViewAllLink from "./ui/ViewAllLink";

// The latest sales and exchanges of the period. showBranch: the all-branch view adds the branch.
const RecentSalesCard = ({ sales, linkTo, showBranch }) => {
  const columns = [
    {
      key: "invoiceNo",
      header: "Invoice",
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-slate-900">
          {row.invoiceNo}
          {row.kind === "exchange" && (
            <Badge tone="purple" className="ml-1.5 font-sans">
              Exchange
            </Badge>
          )}
        </span>
      ),
    },
    { key: "customer", header: "Customer", render: (row) => row.customer?.name ?? <span className="text-slate-400">Walk-in</span> },
    ...(showBranch ? [{ key: "branch", header: "Branch", className: "text-slate-600", render: (row) => row.branch?.name ?? "—" }] : []),
    { key: "date", header: "Date", className: "whitespace-nowrap text-slate-500", render: (row) => formatDateTime(row.date) },
    {
      key: "total",
      header: "Total",
      className: "text-right whitespace-nowrap",
      render: (row) => (
        <span>
          <span className="font-semibold text-slate-900">{formatTaka(row.grandTotal)}</span>
          {row.dueAmount > 0 && <span className="block text-[11px] text-red-600">Due {formatTaka(row.dueAmount)}</span>}
        </span>
      ),
    },
  ];

  return (
    <ChartCard icon={LuShoppingCart} title="Recent Sales" action={<ViewAllLink link={linkTo("sales")} />}>
      <MiniTable rows={sales} columns={columns} emptyText="No sales in this period." />
    </ChartCard>
  );
};

export default RecentSalesCard;
