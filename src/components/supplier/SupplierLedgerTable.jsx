import { LEDGER_TYPE_LABELS } from "../../constants/supplier";
import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { rowNumber } from "../../utils/pagination";
import Badge from "../common/data/Badge";
import DataTable from "../common/data/DataTable";
import Pagination from "../common/data/Pagination";
import SupplierBalance from "./SupplierBalance";

const Amount = ({ value, className }) =>
  value ? <span className={`font-medium ${className}`}>{formatTaka(value)}</span> : <span className="text-slate-300">—</span>;

// Ledger lines (newest first) with the running balance after each one
const SupplierLedgerTable = ({ entries, meta, isLoading, hasFilters, onPageChange, onLimitChange }) => {
  const columns = [
    { key: "index", header: "#", hideBelow: "md", className: "text-slate-500", render: (_, i) => rowNumber(meta, i) },
    { key: "date", header: "Date", hideBelow: "md", className: "whitespace-nowrap text-slate-600", render: (e) => formatDateTime(e.date) },
    {
      key: "type",
      header: "Type",
      // Below md the Date (and below lg the Ref.) columns are hidden, so they sit under the badge
      render: (e) => (
        <div className="min-w-0">
          <Badge tone={LEDGER_TYPE_LABELS[e.type]?.tone}>{LEDGER_TYPE_LABELS[e.type]?.label ?? e.type}</Badge>
          <p className="mt-1 whitespace-nowrap text-xs text-slate-500 md:hidden">{formatDateTime(e.date)}</p>
          {e.reference && <p className="font-mono text-[11px] text-slate-400 lg:hidden">{e.reference}</p>}
        </div>
      ),
    },
    { key: "reference", header: "Ref.", hideBelow: "lg", className: "font-mono text-xs text-slate-700", render: (e) => e.reference || "—" },
    { key: "branch", header: "Branch", hideBelow: "lg", className: "text-slate-600", render: (e) => e.branch?.name ?? "Main admin" },
    { key: "note", header: "Note", hideBelow: "xl", className: "max-w-64 text-slate-600", render: (e) => e.note || "—" },
    {
      // Phones: debit and credit in one column, signed and coloured
      key: "amount",
      header: "Amount",
      headerClassName: "text-right md:hidden",
      className: "text-right whitespace-nowrap md:hidden",
      render: (e) => (
        <div>
          {e.debit ? (
            <span className="font-semibold text-red-600">− {formatTaka(e.debit)}</span>
          ) : (
            <span className="font-semibold text-green-600">+ {formatTaka(e.credit)}</span>
          )}
          {/* Phones: the Balance column is hidden, so the balance after sits here */}
          <p className="mt-0.5 text-[11px] text-slate-500 sm:hidden">
            Bal <SupplierBalance amount={e.balanceAfter} className="text-[11px]" />
          </p>
        </div>
      ),
    },
    {
      key: "debit",
      header: "Debit",
      hideBelow: "md",
      headerClassName: "text-right",
      className: "text-right whitespace-nowrap",
      render: (e) => <Amount value={e.debit} className="text-red-600" />,
    },
    {
      key: "credit",
      header: "Credit",
      hideBelow: "md",
      headerClassName: "text-right",
      className: "text-right whitespace-nowrap",
      render: (e) => <Amount value={e.credit} className="text-green-600" />,
    },
    {
      key: "balance",
      header: "Balance",
      hideBelow: "sm",
      headerClassName: "text-right",
      className: "text-right whitespace-nowrap",
      render: (e) => <SupplierBalance amount={e.balanceAfter} />,
    },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        rows={entries}
        loading={isLoading}
        minWidth={1000}
        minWidthFrom="xl"
        emptyMessage={hasFilters ? "No entries match these filters." : "No entries yet."}
      />
      <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    </div>
  );
};

export default SupplierLedgerTable;
