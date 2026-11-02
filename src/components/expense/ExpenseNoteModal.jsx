import { LuCalendar, LuStickyNote, LuUser } from "react-icons/lu";
import { categoryLabel } from "../../constants/expense";
import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import Modal from "../common/modals/Modal";

// Small dialog with one expense's note, plus what it was for
const ExpenseNoteModal = ({ expense, onClose }) => (
  <Modal isOpen={Boolean(expense)} onClose={onClose} title="Expense Note" subtitle={expense?.expenseNo} placement="center">
    {expense && (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4 rounded-lg bg-slate-50 p-3">
          <div className="min-w-0">
            <p className="truncate font-semibold uppercase text-slate-900">{expense.title}</p>
            <p className="text-xs text-slate-500">{categoryLabel(expense.category)}</p>
          </div>
          <p className="shrink-0 text-lg font-bold text-red-600">{formatTaka(expense.amount)}</p>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
            <LuStickyNote className="h-3.5 w-3.5" aria-hidden="true" />
            Note
          </p>
          <p className="whitespace-pre-line break-words text-sm leading-relaxed text-slate-800">{expense.note}</p>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <LuCalendar className="h-3.5 w-3.5" aria-hidden="true" />
            {formatDateTime(expense.date)}
          </span>
          {expense.createdBy?.name && (
            <span className="inline-flex items-center gap-1">
              <LuUser className="h-3.5 w-3.5" aria-hidden="true" />
              {expense.createdBy.name}
            </span>
          )}
        </div>
      </div>
    )}
  </Modal>
);

export default ExpenseNoteModal;
