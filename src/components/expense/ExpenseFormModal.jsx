import { useId, useState } from "react";
import { EXPENSE_CATEGORIES, EXPENSE_TYPE } from "../../constants/expense";
import { useCreateExpense } from "../../hooks/useExpenseApi";
import { usePaymentMethodOptionsData } from "../../hooks/usePaymentMethodApi";
import { todayInputValue } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { expenseLinesCost, expenseLinesError, toExpenseItems } from "../../utils/expense";
import { newPaymentLine, paymentLinesError, paymentLinesTotal, toPaymentItems } from "../../utils/paymentLines";
import Alert from "../common/alerts/Alert";
import Button from "../common/buttons/Button";
import Input from "../common/forms/Input";
import Select from "../common/forms/Select";
import Textarea from "../common/forms/Textarea";
import Modal from "../common/modals/Modal";
import PaymentMethodLines from "../payment/PaymentMethodLines";
import ExpenseProductItems from "./ExpenseProductItems";

const TYPES = [
  { value: EXPENSE_TYPE.GENERAL, label: "General Expense", hint: "Money spent: rent, bills, transport..." },
  { value: EXPENSE_TYPE.PRODUCT, label: "Product Expense", hint: "Stock used up: shop use, damaged, given away" },
];

// One form for both kinds of expense, switched by the toggle at the top
const ExpenseFormModal = ({ onClose, onSaved }) => {
  const formId = useId();
  const [type, setType] = useState(EXPENSE_TYPE.GENERAL);
  const [form, setForm] = useState({ title: "", category: "other", date: todayInputValue(), note: "" });
  const [payments, setPayments] = useState(() => [newPaymentLine()]);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const { data: methods = [] } = usePaymentMethodOptionsData();
  const createExpense = useCreateExpense();

  const isGeneral = type === EXPENSE_TYPE.GENERAL;
  const productCost = expenseLinesCost(items);
  const total = isGeneral ? paymentLinesTotal(payments) : productCost;

  const setField = (name, value) => {
    setError("");
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const switchType = (next) => {
    setType(next);
    setError("");
    setForm((prev) => ({ ...prev, category: next === EXPENSE_TYPE.PRODUCT ? "product" : prev.category === "product" ? "other" : prev.category }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem =
      (form.title.trim().length < 2 && "Enter a title (at least 2 characters).") ||
      (isGeneral ? paymentLinesError(payments) : expenseLinesError(items));
    if (problem) return setError(problem);

    const base = { type, title: form.title.trim(), category: form.category, date: form.date, note: form.note.trim() };
    const body = isGeneral
      ? { ...base, payments: toPaymentItems(payments) }
      : { ...base, items: toExpenseItems(items) };

    try {
      onSaved(await createExpense.mutateAsync(body));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Create Expense"
      subtitle="Money spent, or stock used up"
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={createExpense.isPending}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={createExpense.isPending} disabled={total <= 0} className="min-w-44">
            Save Expense ({formatTaka(total)})
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
          {TYPES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => switchType(option.value)}
              className={`rounded-md px-3 py-2 text-left transition ${type === option.value ? "bg-brand text-white shadow-sm" : "text-slate-600 hover:bg-white"}`}
            >
              <span className="block text-sm font-semibold">{option.label}</span>
              <span className={`block text-xs ${type === option.value ? "text-white/80" : "text-slate-500"}`}>{option.hint}</span>
            </button>
          ))}
        </div>

        <Alert>{error}</Alert>

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Title"
            required
            autoFocus
            placeholder={isGeneral ? "e.g. Shop rent October" : "e.g. Demo phone for display"}
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            className="sm:col-span-3"
          />
          <Select label="Category" options={EXPENSE_CATEGORIES.filter((c) => c.value !== "salary")} value={form.category} onChange={(e) => setField("category", e.target.value)} />
          <Input label="Date" type="date" max={todayInputValue()} value={form.date} onChange={(e) => setField("date", e.target.value)} />
        </div>

        {isGeneral ? (
          <PaymentMethodLines
            lines={payments}
            onChange={(next) => {
              setError("");
              setPayments(next);
            }}
            methods={methods}
            title="Paid From"
            addLabel="Add Payment Method"
            totalLabel="Total Expense"
            tone="text-red-600"
          />
        ) : (
          <div className="space-y-2">
            <ExpenseProductItems
              lines={items}
              onChange={(next) => {
                setError("");
                setItems(next);
              }}
            />
            {items.length > 0 && (
              <p className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-600">
                Total expense (stock cost): <span className="text-lg font-bold text-red-600">{formatTaka(productCost)}</span>
                <span className="block text-xs">No money moves; the products leave stock at what they cost you.</span>
              </p>
            )}
          </div>
        )}

        <Textarea label="Note" placeholder="Enter expense note (optional)" maxLength={500} value={form.note} onChange={(e) => setField("note", e.target.value)} />
      </form>
    </Modal>
  );
};

export default ExpenseFormModal;
