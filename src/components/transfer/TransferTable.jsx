import { LuArrowRight } from "react-icons/lu";
import { formatDateTime } from "../../utils/formatDate";
import { rowNumber } from "../../utils/pagination";
import Badge from "../common/data/Badge";
import DataTable from "../common/data/DataTable";
import Pagination from "../common/data/Pagination";
import Spinner from "../common/loaders/Spinner";

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

  const emptyMessage = hasFilters ? "No transfer found for these filters." : "No transfers yet.";

  return (
    <div>
      <div className="hidden md:block">
        <DataTable columns={columns} rows={transfers} loading={isLoading} minWidth={1000} emptyMessage={emptyMessage} />
      </div>

      {/* Phones: one card per transfer instead of a wide table */}
      <div className="space-y-3 md:hidden">
        {isLoading ? (
          <div className="flex justify-center rounded-xl bg-white py-16 shadow-sm ring-1 ring-slate-200">
            <Spinner className="h-6 w-6 text-brand" />
          </div>
        ) : transfers.length === 0 ? (
          <p className="rounded-xl bg-white py-16 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">{emptyMessage}</p>
        ) : (
          transfers.map((t) => (
            <button
              key={t._id}
              type="button"
              onClick={() => onView(t)}
              className="block w-full overflow-hidden rounded-xl bg-white text-left text-sm shadow-sm ring-1 ring-slate-200 active:bg-slate-50"
            >
              {/* Number, direction badge and total pieces */}
              <div className="flex items-center justify-between gap-2 px-4 pt-4">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-900">{t.transferNo}</span>
                  {ownBranch &&
                    (t.fromBranch?._id === ownBranch ? <Badge tone="amber">Sent</Badge> : <Badge tone="green">Received</Badge>)}
                </div>
                <span className="shrink-0 rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-white">{t.totalQuantity} pcs</span>
              </div>

              {/* From → To */}
              <div className="mx-4 mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">From</p>
                  <p className="break-words font-semibold text-slate-900">{t.fromBranch?.name}</p>
                </div>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200">
                  <LuArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div className="min-w-0 text-right">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">To</p>
                  <p className="break-words font-semibold text-slate-900">{t.toBranch?.name}</p>
                </div>
              </div>

              {/* Products */}
              <div className="px-4 pt-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Products</p>
                <ul className="mt-1 space-y-0.5">
                  {t.items.slice(0, 2).map((item) => (
                    <li key={item.product} className="flex items-baseline justify-between gap-3 text-slate-800">
                      <span className="truncate uppercase">{item.name}</span>
                      <span className="shrink-0 font-semibold text-slate-900">× {item.quantity}</span>
                    </li>
                  ))}
                </ul>
                {t.items.length > 2 && <p className="mt-0.5 text-xs text-slate-500">+{t.items.length - 2} more</p>}
              </div>

              {/* Date, creator and View */}
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
                <div className="min-w-0 text-xs text-slate-500">
                  <p>{formatDateTime(t.date)}</p>
                  <p className="truncate">By {t.createdBy?.name ?? "—"}</p>
                </div>
                <span className="shrink-0 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700">View</span>
              </div>
            </button>
          ))
        )}
      </div>

      <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    </div>
  );
};

export default TransferTable;
