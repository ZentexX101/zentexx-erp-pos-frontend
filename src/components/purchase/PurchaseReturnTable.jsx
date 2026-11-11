import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { rowNumber } from "../../utils/pagination";
import DataTable from "../common/data/DataTable";
import Pagination from "../common/data/Pagination";

// Purchase returns, newest first. Clicking "View" opens the details.
const PurchaseReturnTable = ({ returns, meta, isLoading, hasFilters, onView, onPageChange, onLimitChange }) => {
  const columns = [
    { key: "index", header: "#", hideBelow: "lg", className: "text-slate-500", render: (_, i) => rowNumber(meta, i) },
    {
      key: "returnNo",
      header: "Return No.",
      // Below md the Date and Supplier columns are hidden, so they sit under the return no.
      render: (r) => (
        <div className="min-w-0">
          <p className="font-mono text-xs font-semibold text-slate-900">{r.returnNo}</p>
          <p className="text-xs text-slate-500 md:hidden">{formatDateTime(r.date)}</p>
          <p className="text-sm font-medium text-slate-900 md:hidden">{r.supplier?.name ?? "—"}</p>
        </div>
      ),
    },
    { key: "date", header: "Date", hideBelow: "md", className: "whitespace-nowrap text-slate-600", render: (r) => formatDateTime(r.date) },
    { key: "supplier", header: "Supplier", hideBelow: "md", className: "font-medium text-slate-900", render: (r) => r.supplier?.name ?? "—" },
    {
      key: "items",
      header: "Items",
      hideBelow: "lg",
      className: "text-slate-600",
      render: (r) => `${r.items.length} product${r.items.length === 1 ? "" : "s"} · ${r.items.reduce((sum, item) => sum + item.quantity, 0)} pcs`,
    },
    {
      key: "total",
      header: "Total",
      headerClassName: "text-right",
      className: "text-right whitespace-nowrap font-semibold text-slate-900",
      render: (r) => formatTaka(r.totalAmount),
    },
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
        minWidth={900}
        minWidthFrom="lg"
        emptyMessage={hasFilters ? "No return matches these filters." : "No purchase returns yet."}
      />
      <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    </div>
  );
};

export default PurchaseReturnTable;
