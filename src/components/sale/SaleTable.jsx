import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { rowNumber } from "../../utils/pagination";
import DataTable from "../common/data/DataTable";
import Pagination from "../common/data/Pagination";

const money = (className = "") => ({ headerClassName: "text-right", className: `text-right whitespace-nowrap ${className}` });

// POS orders or exchanges, newest first. showExchange adds the old-device value. "View" opens the invoice.
const SaleTable = ({ sales, meta, isLoading, hasFilters, showExchange = false, onView, onPageChange, onLimitChange }) => {
  const columns = [
    { key: "index", header: "#", hideBelow: "lg", className: "text-slate-500", render: (_, i) => rowNumber(meta, i) },
    {
      key: "invoiceNo",
      header: "Invoice",
      // Below md the Date and Customer columns are hidden, so they sit under the invoice no.
      render: (s) => (
        <div className="min-w-0">
          <p className="font-mono text-xs font-semibold text-slate-900">{s.invoiceNo}</p>
          <p className="whitespace-nowrap text-xs text-slate-500 md:hidden">{formatDateTime(s.date)}</p>
          <p className="text-sm md:hidden">{s.customer ? <span className="font-medium text-slate-900">{s.customer.name}</span> : <span className="text-slate-400">Walk-in</span>}</p>
        </div>
      ),
    },
    { key: "date", header: "Date", hideBelow: "md", className: "whitespace-nowrap text-slate-600", render: (s) => formatDateTime(s.date) },
    {
      key: "customer",
      header: "Customer",
      hideBelow: "md",
      render: (s) => (s.customer ? <span className="font-medium text-slate-900">{s.customer.name}</span> : <span className="text-slate-400">Walk-in</span>),
    },
    {
      key: "items",
      header: "Items",
      hideBelow: "lg",
      className: "text-slate-600",
      render: (s) => `${[...s.items, ...(s.externalItems ?? [])].reduce((sum, item) => sum + item.quantity, 0)} pcs`,
    },
    {
      key: "grandTotal",
      header: "Total",
      ...money("font-semibold text-slate-900"),
      // Below md the Due column is hidden, so any due sits under the total
      render: (s) => (
        <>
          {formatTaka(s.grandTotal)}
          {s.dueAmount > 0 && <span className="block text-xs font-medium text-red-600 md:hidden">Due {formatTaka(s.dueAmount)}</span>}
        </>
      ),
    },
    ...(showExchange
      ? [
          { key: "exchange", header: "Old Device", hideBelow: "lg", ...money("text-purple-600"), render: (s) => formatTaka(s.exchangeValue) },
          { key: "payout", header: "Paid Out", hideBelow: "xl", ...money("text-orange-600"), render: (s) => (s.payoutAmount ? formatTaka(s.payoutAmount) : "—") },
        ]
      : []),
    { key: "paid", header: "Paid", hideBelow: "lg", ...money("text-green-600"), render: (s) => formatTaka(s.paidAmount) },
    { key: "due", header: "Due", hideBelow: "md", ...money("text-red-600"), render: (s) => (s.dueAmount ? formatTaka(s.dueAmount) : "—") },
    { key: "soldBy", header: "Sold By", hideBelow: "xl", className: "text-slate-600", render: (s) => s.soldBy?.name ?? "—" },
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
        minWidthFrom="xl"
        emptyMessage={hasFilters ? "No sale found for these filters." : "No sales yet."}
      />
      <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    </div>
  );
};

export default SaleTable;
