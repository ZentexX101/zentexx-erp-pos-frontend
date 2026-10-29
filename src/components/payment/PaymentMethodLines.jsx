import { LuPlus, LuTrash2, LuWallet } from "react-icons/lu";
import { formatTaka } from "../../utils/money";
import { toDecimalInput } from "../../utils/number";
import { newPaymentLine, paymentLinesTotal } from "../../utils/paymentLines";
import Button from "../common/buttons/Button";

const fieldClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-brand/10";

// "Payment Methods & Amounts": one or more method + amount lines, like the reference app.
// checkBalance warns when a method can't cover its amount (money going out).
const PaymentMethodLines = ({ lines, onChange, methods, checkBalance = false, title, addLabel, totalLabel, tone = "text-slate-900", footer }) => {
  const methodById = new Map(methods.map((m) => [m._id, m]));
  const total = paymentLinesTotal(lines);

  const setLine = (key, field, value) => onChange(lines.map((line) => (line.key === key ? { ...line, [field]: value } : line)));
  const removeLine = (key) => onChange(lines.length > 1 ? lines.filter((line) => line.key !== key) : lines);

  return (
    <section className="rounded-lg border border-slate-200 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-semibold text-slate-900">
          <LuWallet className="h-4 w-4" aria-hidden="true" />
          {title}
        </h3>
        <Button variant="secondary" onClick={() => onChange([...lines, newPaymentLine()])} disabled={lines.length >= methods.length}>
          <LuPlus className="h-4 w-4" aria-hidden="true" />
          {addLabel}
        </Button>
      </div>

      <div className="space-y-2">
        {lines.map((line, index) => {
          const method = methodById.get(line.paymentMethod);
          const short = checkBalance && method && Number(line.amount) > method.balance;
          // A method already used on another line can't be picked again
          const taken = new Set(lines.filter((l) => l.key !== line.key).map((l) => l.paymentMethod));
          return (
            <div key={line.key} className="flex flex-wrap items-start gap-3 rounded-lg bg-slate-50 p-3">
              <span className="pt-2 text-sm font-semibold text-slate-500">#{index + 1}</span>
              <div className="min-w-48 flex-1">
                <select
                  aria-label={`Payment method ${index + 1}`}
                  value={line.paymentMethod}
                  onChange={(e) => setLine(line.key, "paymentMethod", e.target.value)}
                  className={fieldClass}
                >
                  <option value="">Select Payment Method</option>
                  {methods
                    .filter((m) => !taken.has(m._id))
                    .map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({formatTaka(m.balance)})
                      </option>
                    ))}
                </select>
                {short && <p className="mt-1 text-xs text-red-600">Only {formatTaka(method.balance)} available</p>}
              </div>
              <input
                inputMode="decimal"
                aria-label={`Amount ${index + 1}`}
                placeholder="Amount (৳)"
                value={line.amount}
                onChange={(e) => setLine(line.key, "amount", toDecimalInput(e.target.value))}
                className={`${fieldClass} w-40`}
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
