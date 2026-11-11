import { LuPlus, LuTrash2, LuWallet } from "react-icons/lu";
import { formatTaka } from "../../utils/money";
import { toDecimalInput } from "../../utils/number";
import { newPaymentLine, paymentLinesTotal } from "../../utils/paymentLines";
import Button from "../common/buttons/Button";

const fieldClass =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-brand/10";

// "Payment Methods & Amounts": one or more method + amount lines, like the reference app.
const PaymentMethodLines = ({ lines, onChange, methods, title, addLabel, totalLabel, tone = "text-slate-900", footer }) => {
  const total = paymentLinesTotal(lines);

  const setLine = (key, field, value) => onChange(lines.map((line) => (line.key === key ? { ...line, [field]: value } : line)));
  const removeLine = (key) => onChange(lines.length > 1 ? lines.filter((line) => line.key !== key) : lines);

  return (
    // A container: the layout follows this box (it sits in narrow side panels on desktop too)
    <section className="@container rounded-lg border border-slate-200 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="flex min-w-0 items-start gap-2 font-semibold leading-snug text-slate-900">
          <LuWallet className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {title}
        </h3>
        {/* Narrow: just "+ Add" so the title keeps its line */}
        <Button
          variant="secondary"
          onClick={() => onChange([...lines, newPaymentLine()])}
          disabled={lines.length >= methods.length}
          className="shrink-0 @max-md:px-3"
          aria-label={addLabel}
        >
          <LuPlus className="h-4 w-4" aria-hidden="true" />
          <span className="@md:hidden">Add</span>
          <span className="hidden @md:inline">{addLabel}</span>
        </Button>
      </div>

      <div className="space-y-2">
        {lines.map((line, index) => {
          // A method already used on another line can't be picked again
          const taken = new Set(lines.filter((l) => l.key !== line.key).map((l) => l.paymentMethod));
          return (
            // Narrow: #, method across; amount and remove under it. From @md: all on one line
            <div
              key={line.key}
              className="grid grid-cols-[1.5rem_minmax(0,1fr)_2.25rem] items-center gap-2 rounded-lg bg-slate-50 p-3 @md:grid-cols-[1.5rem_minmax(0,1fr)_10rem_2.25rem] @md:gap-3"
            >
              <span className="text-sm font-semibold text-slate-500">#{index + 1}</span>
              <div className="col-span-2 min-w-0 @md:col-span-1">
                <select
                  aria-label={`Payment method ${index + 1}`}
                  value={line.paymentMethod}
                  onChange={(e) => setLine(line.key, "paymentMethod", e.target.value)}
                  className={`${fieldClass} w-full`}
                >
                  <option value="">Select Payment Method</option>
                  {methods
                    .filter((m) => !taken.has(m._id))
                    .map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                </select>
              </div>
              <input
                inputMode="decimal"
                aria-label={`Amount ${index + 1}`}
                placeholder="Amount (৳)"
                value={line.amount}
                onChange={(e) => setLine(line.key, "amount", toDecimalInput(e.target.value))}
                className={`${fieldClass} col-start-2 w-full min-w-0 @md:col-start-auto`}
              />
              <button
                type="button"
                onClick={() => removeLine(line.key)}
                disabled={lines.length === 1}
                className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                aria-label={`Remove line ${index + 1}`}
              >
                <LuTrash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-100 px-4 py-3">
        <span className="text-sm font-medium text-slate-600">
          {totalLabel}: <span className={`text-lg font-bold ${tone}`}>{formatTaka(total)}</span>
        </span>
        {footer}
      </div>
    </section>
  );
};

export default PaymentMethodLines;
