import { LuArrowRight } from "react-icons/lu";
import { formatDateTime } from "../../utils/formatDate";
import { rowNumber } from "../../utils/pagination";
import Badge from "../common/data/Badge";
import DataTable from "../common/data/DataTable";
import Pagination from "../common/data/Pagination";

// Transfers, newest first. ownBranch (branch panel) marks each row as Sent or Received.
// "View" opens the items, IMEIs and note.
const TransferTable = ({ transfers, meta, isLoading, hasFilters, ownBranch, onView, onPageChange, onLimitChange }) => {
  const columns = [
    { key: "index", header: "#", className: "text-slate-500", render: (_, i) => rowNumber(meta, i) },
    { key: "transferNo", header: "Transfer No.", className: "font-mono text-xs font-semibold text-slate-900" },
    {
      key: "route",
      header: "From → To",
      render: (t) => (
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="font-medium text-slate-900">{t.fromBranch?.name}</span>
          <LuArrowRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="font-medium text-slate-900">{t.toBranch?.name}</span>
          {ownBranch &&
            (t.fromBranch?._id === ownBranch ? <Badge tone="amber">Sent</Badge> : <Badge tone="green">Received</Badge>)}
        </span>
      ),
    },
    {
      key: "products",
      header: "Products",
      className: "max-w-80",
      render: (t) => (
        <span className="text-slate-700">
          {t.items.slice(0, 2).map((item) => (
            <span key={item.product} className="block truncate uppercase">
              {item.quantity} × {item.name}
            </span>
          ))}
          {t.items.length > 2 && <span className="text-xs text-slate-500">+{t.items.length - 2} more</span>}
        </span>
      ),
    },
    { key: "units", header: "Quantity", headerClassName: "text-right", className: "text-right font-semibold text-slate-900", render: (t) => t.totalQuantity },
    { key: "date", header: "Date", className: "whitespace-nowrap text-slate-600", render: (t) => formatDateTime(t.date) },
    { key: "createdBy", header: "By", className: "text-slate-600", render: (t) => t.createdBy?.name ?? "—" },
    {
      key: "actions",
      header: "Action",
      headerClassName: "text-right",
      render: (t) => (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onView(t)}
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
        rows={transfers}
        loading={isLoading}
        minWidth={1000}
        emptyMessage={hasFilters ? "No transfer found for these filters." : "No transfers yet."}
      />
      <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    </div>
  );
};

export default TransferTable;
