import { LuStickyNote } from "react-icons/lu";
import { categoryLabel, EXPENSE_TYPE } from "../../constants/expense";
import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { rowNumber } from "../../utils/pagination";
import Badge from "../common/data/Badge";
import DataTable from "../common/data/DataTable";
import Pagination from "../common/data/Pagination";

// Where the money / stock went: payment methods for general expenses, products for product expenses
const Source = ({ expense }) =>
  expense.type === EXPENSE_TYPE.GENERAL ? (
    <span className="text-slate-700">{expense.payments.map((line) => line.paymentMethod?.name).join(", ")}</span>
  ) : (
    <span className="text-slate-700">
      {expense.items.map((item) => `${item.quantity} × ${item.name}`).join(", ")}
      {expense.items.some((item) => item.serials.length) && (
        <span className="block font-mono text-xs text-slate-500">{expense.items.flatMap((item) => item.serials).join(", ")}</span>
      )}
    </span>
  );

// Expenses, newest first. The note button lights up when there is a note and opens it.
const ExpenseTable = ({ expenses, meta, isLoading, hasFilters, onNote, onPageChange, onLimitChange }) => {
  const columns = [
    { key: "index", header: "#", className: "text-slate-500", render: (_, i) => rowNumber(meta, i) },
    { key: "expenseNo", header: "No.", className: "font-mono text-xs text-slate-600" },
    {
      key: "title",
      header: "Expense Title",
      className: "min-w-48 font-medium uppercase text-slate-900",
      render: (e) => e.title,
    },
    {
      key: "note",
      header: "Note",
      headerClassName: "text-center",
      className: "text-center",
      render: (e) => (
        <button
          type="button"
          onClick={() => onNote(e)}
          disabled={!e.note}
          title={e.note ? "View note" : "No note"}
          aria-label={e.note ? `View note of ${e.title}` : "No note"}
          className={`inline-flex rounded-md border p-1.5 transition ${
            e.note ? "border-amber-300 bg-amber-50 text-amber-600 hover:bg-amber-100" : "cursor-default border-slate-200 text-slate-300"
          }`}
        >
          <LuStickyNote className="h-4 w-4" aria-hidden="true" />
        </button>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (e) => (
        <span className="flex flex-wrap items-center gap-1">
          <Badge tone={e.type === EXPENSE_TYPE.PRODUCT ? "purple" : "slate"}>{e.type === EXPENSE_TYPE.PRODUCT ? "Product" : "General"}</Badge>
          <span className="text-xs text-slate-600">{categoryLabel(e.category)}</span>
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      headerClassName: "text-right",
      className: "text-right whitespace-nowrap font-semibold text-red-600",
      render: (e) => formatTaka(e.amount),
    },
    { key: "source", header: "Paid From / Product", className: "max-w-72", render: (e) => <Source expense={e} /> },
    { key: "date", header: "Date", className: "whitespace-nowrap text-slate-600", render: (e) => formatDateTime(e.date) },
    { key: "createdBy", header: "By", className: "text-slate-600", render: (e) => e.createdBy?.name ?? "—" },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        rows={expenses}
        loading={isLoading}
        minWidth={1050}
        emptyMessage={hasFilters ? "No expense found for these filters." : "No expenses yet."}
      />
      <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    </div>
  );
};

export default ExpenseTable;
