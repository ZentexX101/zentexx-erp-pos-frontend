import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { rowNumber } from "../../utils/pagination";
import DataTable from "../common/data/DataTable";
import Pagination from "../common/data/Pagination";

const money = (className = "") => ({ headerClassName: "text-right", className: `text-right whitespace-nowrap ${className}` });

// POS orders, newest first. "View" opens the invoice.
const SaleTable = ({ sales, meta, isLoading, hasFilters, onView, onPageChange, onLimitChange }) => {
  const columns = [
    { key: "index", header: "#", className: "text-slate-500", render: (_, i) => rowNumber(meta, i) },
    { key: "invoiceNo", header: "Invoice", className: "font-mono text-xs font-semibold text-slate-900" },
    { key: "date", header: "Date", className: "whitespace-nowrap text-slate-600", render: (s) => formatDateTime(s.date) },
    {
      key: "customer",
      header: "Customer",
      render: (s) =>
        s.customer ? <span className="font-medium text-slate-900">{s.customer.name}</span> : <span className="text-slate-400">Walk-in</span>,
    },
    {
      key: "items",
      header: "Items",
      className: "text-slate-600",
      render: (s) => `${s.items.reduce((sum, item) => sum + item.quantity, 0)} pcs`,
    },
    { key: "grandTotal", header: "Total", ...money("font-semibold text-slate-900"), render: (s) => formatTaka(s.grandTotal) },
    { key: "paid", header: "Paid", ...money("text-green-600"), render: (s) => formatTaka(s.paidAmount) },
    { key: "due", header: "Due", ...money("text-red-600"), render: (s) => (s.dueAmount ? formatTaka(s.dueAmount) : "—") },
    { key: "soldBy", header: "Sold By", className: "text-slate-600", render: (s) => s.soldBy?.name ?? "—" },
    {
      key: "actions",
      header: "Action",
      headerClassName: "text-right",
      render: (s) => (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onView(s)}
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
        rows={sales}
        loading={isLoading}
        minWidth={1050}
        emptyMessage={hasFilters ? "No sale found for these filters." : "No sales yet."}
      />
      <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    </div>
  );
};

export default SaleTable;
