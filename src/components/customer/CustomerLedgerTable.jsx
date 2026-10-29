import { LEDGER_TYPE_LABELS } from "../../constants/customer";
import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { rowNumber } from "../../utils/pagination";
import Badge from "../common/data/Badge";
import DataTable from "../common/data/DataTable";
import Pagination from "../common/data/Pagination";
import CustomerBalance from "./CustomerBalance";

const Amount = ({ value, className }) =>
  value ? <span className={`font-medium ${className}`}>{formatTaka(value)}</span> : <span className="text-slate-300">—</span>;

// Ledger lines (newest first) with the running balance after each one
const CustomerLedgerTable = ({ entries, meta, isLoading, hasFilters, onPageChange, onLimitChange }) => {
  const columns = [
    { key: "index", header: "#", className: "text-slate-500", render: (_, i) => rowNumber(meta, i) },
    { key: "date", header: "Date", className: "whitespace-nowrap text-slate-600", render: (e) => formatDateTime(e.date) },
    {
      key: "type",
      header: "Type",
      render: (e) => <Badge tone={LEDGER_TYPE_LABELS[e.type]?.tone}>{LEDGER_TYPE_LABELS[e.type]?.label ?? e.type}</Badge>,
    },
    { key: "reference", header: "Ref.", className: "font-mono text-xs text-slate-700", render: (e) => e.reference || "—" },
    { key: "branch", header: "Branch", className: "text-slate-600", render: (e) => e.branch?.name ?? "Main admin" },
    { key: "note", header: "Note", className: "max-w-64 text-slate-600", render: (e) => e.note || "—" },
    {
      key: "debit",
      header: "Debit",
      headerClassName: "text-right",
      className: "text-right whitespace-nowrap",
      render: (e) => <Amount value={e.debit} className="text-red-600" />,
    },
    {
      key: "credit",
      header: "Credit",
      headerClassName: "text-right",
      className: "text-right whitespace-nowrap",
      render: (e) => <Amount value={e.credit} className="text-green-600" />,
    },
    {
      key: "balance",
      header: "Balance",
      headerClassName: "text-right",
      className: "text-right whitespace-nowrap",
      render: (e) => <CustomerBalance amount={e.balanceAfter} />,
    },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        rows={entries}
        loading={isLoading}
        minWidth={1000}
        emptyMessage={hasFilters ? "No entries match these filters." : "No entries yet."}
      />
      <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    </div>
  );
};

export default CustomerLedgerTable;
