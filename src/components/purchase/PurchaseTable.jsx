import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { rowNumber } from "../../utils/pagination";
import DataTable from "../common/data/DataTable";
import Pagination from "../common/data/Pagination";

const money = (className) => ({
  headerClassName: "text-right",
  className: `text-right whitespace-nowrap ${className}`,
});

// Purchase invoices, newest first. Clicking "View" opens the details.
const PurchaseTable = ({ purchases, meta, isLoading, hasFilters, onView, onPageChange, onLimitChange }) => {
  const columns = [
    { key: "index", header: "#", className: "text-slate-500", render: (_, i) => rowNumber(meta, i) },
    { key: "invoiceNo", header: "Invoice", className: "font-mono text-xs font-semibold text-slate-900" },
    { key: "date", header: "Date", className: "whitespace-nowrap text-slate-600", render: (p) => formatDateTime(p.date) },
    { key: "supplier", header: "Supplier", className: "font-medium text-slate-900", render: (p) => p.supplier?.name ?? "—" },
    {
      key: "items",
      header: "Items",
      className: "text-slate-600",
      render: (p) => `${p.items.length} product${p.items.length === 1 ? "" : "s"} · ${p.items.reduce((sum, item) => sum + item.quantity, 0)} pcs`,
    },
    { key: "total", header: "Total", ...money("font-semibold text-slate-900"), render: (p) => formatTaka(p.totalAmount) },
    { key: "paid", header: "Paid", ...money("text-green-600"), render: (p) => formatTaka(p.paidAmount) },
    { key: "due", header: "Due", ...money("text-red-600"), render: (p) => (p.dueAmount ? formatTaka(p.dueAmount) : "—") },
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
        rows={purchases}
        loading={isLoading}
        minWidth={1050}
        emptyMessage={hasFilters ? "No purchase matches these filters." : "No purchases yet."}
      />
      <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    </div>
  );
};

export default PurchaseTable;
