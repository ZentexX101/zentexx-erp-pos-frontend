import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { rowNumber } from "../../utils/pagination";
import DataTable from "../common/data/DataTable";
import Pagination from "../common/data/Pagination";

// Purchase returns, newest first. Clicking "View" opens the details.
const PurchaseReturnTable = ({ returns, meta, isLoading, hasFilters, onView, onPageChange, onLimitChange }) => {
  const columns = [
    { key: "index", header: "#", className: "text-slate-500", render: (_, i) => rowNumber(meta, i) },
    { key: "returnNo", header: "Return No.", className: "font-mono text-xs font-semibold text-slate-900" },
    { key: "date", header: "Date", className: "whitespace-nowrap text-slate-600", render: (r) => formatDateTime(r.date) },
    { key: "supplier", header: "Supplier", className: "font-medium text-slate-900", render: (r) => r.supplier?.name ?? "—" },
    {
      key: "items",
      header: "Items",
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
        minWidth={900}
        emptyMessage={hasFilters ? "No return matches these filters." : "No purchase returns yet."}
      />
      <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    </div>
  );
};

export default PurchaseReturnTable;
