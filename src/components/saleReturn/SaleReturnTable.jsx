import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { rowNumber } from "../../utils/pagination";
import DataTable from "../common/data/DataTable";
import Pagination from "../common/data/Pagination";

const money = (className = "") => ({ headerClassName: "text-right", className: `text-right whitespace-nowrap ${className}` });

// POS returns, newest first. "View" opens the details.
const SaleReturnTable = ({ returns, meta, isLoading, hasFilters, onView, onPageChange, onLimitChange }) => {
  const columns = [
    { key: "index", header: "#", className: "text-slate-500", render: (_, i) => rowNumber(meta, i) },
    { key: "returnNo", header: "Return ID", className: "font-mono text-xs font-semibold text-slate-900" },
    { key: "invoiceNo", header: "Order", className: "font-mono text-xs text-slate-600" },
    { key: "date", header: "Date", className: "whitespace-nowrap text-slate-600", render: (r) => formatDateTime(r.date) },
    {
      key: "customer",
      header: "Customer",
      render: (r) => (r.customer ? <span className="font-medium text-slate-900">{r.customer.name}</span> : <span className="text-slate-400">Walk-in</span>),
    },
    { key: "items", header: "Items", className: "text-slate-600", render: (r) => `${r.items.reduce((sum, item) => sum + item.quantity, 0)} pcs` },
    { key: "total", header: "Return Total", ...money("font-semibold text-slate-900"), render: (r) => formatTaka(r.totalAmount) },
    { key: "refund", header: "Refunded", ...money("text-orange-600"), render: (r) => formatTaka(r.refundAmount) },
    { key: "createdBy", header: "By", className: "text-slate-600", render: (r) => r.createdBy?.name ?? "—" },
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
        emptyMessage={hasFilters ? "No POS return orders found for these filters." : "No POS return orders yet. New returns will appear here."}
      />
      <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    </div>
  );
};

export default SaleReturnTable;
