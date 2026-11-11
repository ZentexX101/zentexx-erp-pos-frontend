import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { rowNumber } from "../../utils/pagination";
import DataTable from "../common/data/DataTable";
import Pagination from "../common/data/Pagination";

const money = (className = "") => ({ headerClassName: "text-right", className: `text-right whitespace-nowrap ${className}` });

// POS returns, newest first. "View" opens the details.
const SaleReturnTable = ({ returns, meta, isLoading, hasFilters, onView, onPageChange, onLimitChange }) => {
  const columns = [
    { key: "index", header: "#", hideBelow: "lg", className: "text-slate-500", render: (_, i) => rowNumber(meta, i) },
    {
      key: "returnNo",
      header: "Return ID",
      // Below lg the Order (below md the Date and Customer) columns are hidden, so they sit here
      render: (r) => (
        <div className="min-w-0">
          <p className="font-mono text-xs font-semibold text-slate-900">{r.returnNo}</p>
          <p className="font-mono text-[11px] text-slate-500 lg:hidden">Order {r.invoiceNo}</p>
          <p className="text-xs text-slate-500 md:hidden">{formatDateTime(r.date)}</p>
          <p className="text-sm md:hidden">{r.customer ? <span className="font-medium text-slate-900">{r.customer.name}</span> : <span className="text-slate-400">Walk-in</span>}</p>
        </div>
      ),
    },
    { key: "invoiceNo", header: "Order", hideBelow: "lg", className: "font-mono text-xs text-slate-600" },
    { key: "date", header: "Date", hideBelow: "md", className: "whitespace-nowrap text-slate-600", render: (r) => formatDateTime(r.date) },
    {
      key: "customer",
      header: "Customer",
      hideBelow: "md",
      render: (r) => (r.customer ? <span className="font-medium text-slate-900">{r.customer.name}</span> : <span className="text-slate-400">Walk-in</span>),
    },
    { key: "items", header: "Items", hideBelow: "lg", className: "text-slate-600", render: (r) => `${r.items.reduce((sum, item) => sum + item.quantity, 0)} pcs` },
    {
      key: "total",
      header: (
        <>
          <span className="sm:hidden">Total</span>
          <span className="hidden sm:inline">Return Total</span>
        </>
      ),
      ...money("font-semibold text-slate-900"),
      // Below md the Refunded column is hidden, so the refund sits under the total
      render: (r) => (
        <>
          {formatTaka(r.totalAmount)}
          <span className="block text-xs font-medium text-orange-600 md:hidden">Refund {formatTaka(r.refundAmount)}</span>
        </>
      ),
    },
    { key: "refund", header: "Refunded", hideBelow: "md", ...money("text-orange-600"), render: (r) => formatTaka(r.refundAmount) },
    { key: "createdBy", header: "By", hideBelow: "xl", className: "text-slate-600", render: (r) => r.createdBy?.name ?? "—" },
    {
      key: "actions",
      header: "Action",
      headerClassName: "text-right",
      render: (r) => (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onView(r)}
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
        rows={returns}
        loading={isLoading}
        minWidth={1050}
        minWidthFrom="xl"
        emptyMessage={hasFilters ? "No POS return orders found for these filters." : "No POS return orders yet. New returns will appear here."}
      />
      <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    </div>
  );
};

export default SaleReturnTable;
