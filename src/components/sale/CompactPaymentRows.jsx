import { LuPlus, LuTrash2 } from "react-icons/lu";
import { toDecimalInput } from "../../utils/number";

// Narrow "method + amount" rows for the POS / exchange summaries, with "Split payment".
// lines: [{ key, paymentMethod, amount }]; onChange(next). title: e.g. "Payment Methods" / "Pay out through".
const CompactPaymentRows = ({ title, lines, onChange, methods, tone = "green" }) => {
  const setLine = (key, field, value) => onChange(lines.map((line) => (line.key === key ? { ...line, [field]: value } : line)));
  const taken = (key) => new Set(lines.filter((line) => line.key !== key).map((line) => line.paymentMethod));
  const amountTone = tone === "green" ? "border-green-300 bg-green-50 focus:ring-green-200" : "border-orange-300 bg-orange-50 focus:ring-orange-200";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <button
          type="button"
          onClick={() => onChange([...lines, { key: crypto.randomUUID(), paymentMethod: "", amount: "" }])}
          disabled={lines.length >= methods.length}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline disabled:opacity-40"
        >
          <LuPlus className="h-3.5 w-3.5" aria-hidden="true" />
          Split payment
        </button>
      </div>
      {lines.map((line, index) => (
        <div key={line.key} className="flex items-center gap-2">
          <select
            aria-label={`Payment method ${index + 1}`}
            value={line.paymentMethod}
            onChange={(e) => setLine(line.key, "paymentMethod", e.target.value)}
            className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-brand/10"
          >
            <option value="">{methods.length ? "Select payment method" : "No active payment method"}</option>
            {methods
              .filter((m) => !taken(line.key).has(m._id))
              .map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
          </select>
          <input
            inputMode="decimal"
            aria-label={`Amount ${index + 1}`}
            value={line.amount}
            onChange={(e) => setLine(line.key, "amount", toDecimalInput(e.target.value))}
            placeholder="0"
            className={`h-10 w-28 rounded-lg border px-3 text-right text-sm font-semibold outline-none focus:ring-2 sm:w-32 ${amountTone}`}
          />
          {lines.length > 1 && (
            <button
              type="button"
              onClick={() => onChange(lines.filter((l) => l.key !== line.key))}
              className="rounded p-1 text-slate-400 hover:text-red-600"
              aria-label={`Remove payment ${index + 1}`}
            >
              <LuTrash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default CompactPaymentRows;
