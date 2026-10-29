import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { rowNumber } from "../../utils/pagination";
import Badge from "../common/data/Badge";
import DataTable from "../common/data/DataTable";
import Pagination from "../common/data/Pagination";

// Payment rows (supplier payments, customer payments / payouts), newest first.
// party: "supplier" | "customer" (the field holding who was paid). showBranch adds a Branch column (main admin lists).
const PaymentTable = ({ payments, meta, isLoading, hasFilters, party, noun = "payment", showBranch = false, onView, onPageChange, onLimitChange }) => {
  const columns = [
    { key: "index", header: "#", className: "text-slate-500", render: (_, i) => rowNumber(meta, i) },
    { key: "paymentNo", header: "Payment No.", className: "font-mono text-xs font-semibold text-slate-900" },
    { key: "date", header: "Date", className: "whitespace-nowrap text-slate-600", render: (p) => formatDateTime(p.date) },
    ...(showBranch ? [{ key: "branch", header: "Branch", className: "text-slate-700", render: (p) => p.branch?.name ?? "—" }] : []),
    {
      key: party,
      header: party === "supplier" ? "Supplier" : "Customer",
      className: "font-medium text-slate-900",
      render: (p) => p[party]?.name ?? "—",
    },
    {
      key: "methods",
      header: "Methods",
      render: (p) => (
        <div className="flex flex-wrap gap-1">
          {p.payments.map((line) => (
            <Badge key={line.paymentMethod?._id} tone="outline">
              {line.paymentMethod?.name}: {formatTaka(line.amount)}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      headerClassName: "text-right",
      className: "text-right whitespace-nowrap font-semibold text-slate-900",
      render: (p) => formatTaka(p.totalAmount),
    },
    { key: "createdBy", header: "By", className: "text-slate-600", render: (p) => p.createdBy?.name ?? "—" },
    {
      key: "actions",
      header: "Action",
      headerClassName: "text-right",
      render: (p) => (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onView(p)}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            View
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        rows={payments}
        loading={isLoading}
        minWidth={showBranch ? 1100 : 1000}
        emptyMessage={hasFilters ? `No ${noun} found for these filters.` : `No ${noun} yet.`}
      />
      <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    </div>
  );
};

export default PaymentTable;
