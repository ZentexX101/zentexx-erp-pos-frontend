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
    { key: "index", header: "#", hideBelow: "lg", className: "text-slate-500", render: (_, i) => rowNumber(meta, i) },
    {
      key: "invoiceNo",
      header: "Invoice",
      // Below md the Date and Supplier columns are hidden, so they sit under the invoice no.
      render: (p) => (
        <div className="min-w-0">
          <p className="font-mono text-xs font-semibold text-slate-900">{p.invoiceNo}</p>
          <p className="text-xs text-slate-500 md:hidden">{formatDateTime(p.date)}</p>
          <p className="text-sm font-medium text-slate-900 md:hidden">{p.supplier?.name ?? "—"}</p>
        </div>
      ),
    },
    { key: "date", header: "Date", hideBelow: "md", className: "whitespace-nowrap text-slate-600", render: (p) => formatDateTime(p.date) },
    { key: "supplier", header: "Supplier", hideBelow: "md", className: "font-medium text-slate-900", render: (p) => p.supplier?.name ?? "—" },
    {
      key: "items",
      header: "Items",
      hideBelow: "lg",
      className: "text-slate-600",
      render: (p) => `${p.items.length} product${p.items.length === 1 ? "" : "s"} · ${p.items.reduce((sum, item) => sum + item.quantity, 0)} pcs`,
    },
    {
      key: "total",
      header: "Total",
      ...money("font-semibold text-slate-900"),
      // Below md the Due column is hidden, so any due sits under the total
      render: (p) => (
        <>
          {formatTaka(p.totalAmount)}
          {p.dueAmount > 0 && <span className="block text-xs font-medium text-red-600 md:hidden">Due {formatTaka(p.dueAmount)}</span>}
        </>
      ),
    },
    { key: "paid", header: "Paid", hideBelow: "lg", ...money("text-green-600"), render: (p) => formatTaka(p.paidAmount) },
    { key: "due", header: "Due", hideBelow: "md", ...money("text-red-600"), render: (p) => (p.dueAmount ? formatTaka(p.dueAmount) : "—") },
    { key: "createdBy", header: "By", hideBelow: "xl", className: "text-slate-600", render: (p) => p.createdBy?.name ?? "—" },
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
        minWidthFrom="xl"
        emptyMessage={hasFilters ? "No purchase matches these filters." : "No purchases yet."}
      />
      <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    </div>
  );
};

export default PurchaseTable;
