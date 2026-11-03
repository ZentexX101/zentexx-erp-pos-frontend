import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { rowNumber } from "../../utils/pagination";
import DataTable from "../common/data/DataTable";
import Pagination from "../common/data/Pagination";

const money = (className = "") => ({ headerClassName: "text-right", className: `text-right whitespace-nowrap ${className}` });

// Service sales, newest first: the service, the device it's for (and its invoice), what was paid and owed.
// emptyState: what to show when nothing matches (the page explains the module there).
const ServiceSaleTable = ({ rows, meta, isLoading, emptyState, onPageChange, onLimitChange }) => {
  const columns = [
    { key: "index", header: "#", className: "text-slate-500", render: (_, i) => rowNumber(meta, i) },
    {
      key: "saleNo",
      header: "No.",
      render: (r) => (
        <>
          <span className="block font-mono text-xs font-semibold text-slate-900">{r.saleNo}</span>
          <span className="block whitespace-nowrap text-xs text-slate-500">{formatDateTime(r.date)}</span>
        </>
      ),
    },
    {
      key: "service",
      header: "Service",
      render: (r) => (
        <>
          <span className="block font-medium text-slate-900">{r.serviceName}</span>
          <span className="block text-xs text-slate-500">
            {r.pricePercent}% of {formatTaka(r.basePrice)}
          </span>
        </>
      ),
    },
    {
      key: "device",
      header: "Device",
      render: (r) => (
        <>
          <span className="block max-w-56 truncate font-medium uppercase text-slate-900" title={r.productName}>
            {r.productName}
          </span>
          <span className="block font-mono text-xs text-slate-500">
            {r.serial ?? `${r.quantity} pcs`} · {r.invoiceNo}
          </span>
        </>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (r) => (r.customer ? <span className="font-medium text-slate-900">{r.customer.name}</span> : <span className="text-slate-400">Walk-in</span>),
    },
    { key: "total", header: "Total", ...money("font-semibold text-slate-900"), render: (r) => formatTaka(r.total) },
    { key: "paid", header: "Paid", ...money("text-green-600"), render: (r) => formatTaka(r.paidAmount) },
    { key: "due", header: "Due", ...money("text-red-600"), render: (r) => (r.dueAmount ? formatTaka(r.dueAmount) : "—") },
    { key: "incentive", header: "Incentive", ...money("text-amber-700"), render: (r) => formatTaka(r.incentive) },
    { key: "soldBy", header: "Sold By", className: "text-slate-600", render: (r) => r.soldBy?.name ?? "—" },
  ];

  return (
    <div>
      <DataTable columns={columns} rows={rows} loading={isLoading} minWidth={1100} emptyMessage={emptyState} />
      <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    </div>
  );
};

export default ServiceSaleTable;
