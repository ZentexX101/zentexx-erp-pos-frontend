import { LuPlus, LuTrash2 } from "react-icons/lu";
import { formatTaka } from "../../utils/money";
import { toDecimalInput } from "../../utils/number";
import Button from "../common/buttons/Button";

const amountClass =
  "w-36 rounded-md border border-slate-300 bg-white px-3 py-2 text-right text-sm font-semibold text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-brand/10";

const Row = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-sm font-semibold text-slate-700">{label}</span>
    {children}
  </div>
);

// Totals, discount, delivery charge and how it's paid (one or more payment methods).
// payments: [{ key, paymentMethod, amount }]; onPayments(next). due > 0 needs a customer.
const PosOrderSummary = ({
  itemCount,
  subTotal,
  discount,
  deliveryCharge,
  onAmount,
  grandTotal,
  payments,
  onPayments,
  methods,
  paid,
  due,
  onPayFull,
  onSubmit,
  submitting,
  disabled,
}) => {
  const setLine = (key, field, value) => onPayments(payments.map((line) => (line.key === key ? { ...line, [field]: value } : line)));
  const taken = (key) => new Set(payments.filter((line) => line.key !== key).map((line) => line.paymentMethod));

  return (
    <section className="space-y-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">
          Order Summary <span className="text-xs font-normal text-indigo-500">(অর্ডার হিসাব)</span>
        </h2>
        <span className="text-xs font-semibold text-slate-500">Items: {itemCount}</span>
      </div>

      <Row label="Sub Total (মোট):">
        <span className="w-36 rounded-md bg-slate-50 px-3 py-2 text-right text-sm font-bold text-slate-900">{formatTaka(subTotal)}</span>
      </Row>
      <Row label="Discount (ছাড়):">
        <input inputMode="decimal" aria-label="Discount" value={discount} onChange={(e) => onAmount("discount", toDecimalInput(e.target.value))} placeholder="0" className={amountClass} />
      </Row>
      <Row label="Delivery Charge (ডেলিভারি চার্জ):">
        <input
          inputMode="decimal"
          aria-label="Delivery charge"
          value={deliveryCharge}
          onChange={(e) => onAmount("deliveryCharge", toDecimalInput(e.target.value))}
          placeholder="0"
          className={amountClass}
        />
      </Row>

      <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
        <span className="font-bold">GRAND TOTAL (সর্বমোট):</span>
        <span className="text-xl font-bold text-green-400">{formatTaka(grandTotal)}</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Payment Methods</span>
          <button
            type="button"
            onClick={() => onPayments([...payments, { key: crypto.randomUUID(), paymentMethod: "", amount: "" }])}
            disabled={payments.length >= methods.length}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline disabled:opacity-40"
          >
            <LuPlus className="h-3.5 w-3.5" aria-hidden="true" />
            Split payment
          </button>
        </div>
        {payments.map((line, index) => (
          <div key={line.key} className="flex items-center gap-2">
            <select
              aria-label={`Payment method ${index + 1}`}
              value={line.paymentMethod}
              onChange={(e) => setLine(line.key, "paymentMethod", e.target.value)}
              className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-2 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-brand/10"
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
              className="w-28 rounded-md border border-green-300 bg-green-50 px-2 py-2 text-right text-sm font-semibold outline-none focus:ring-2 focus:ring-green-200"
            />
            {payments.length > 1 && (
              <button
                type="button"
                onClick={() => onPayments(payments.filter((l) => l.key !== line.key))}
                className="rounded p-1 text-slate-400 hover:text-red-600"
                aria-label={`Remove payment ${index + 1}`}
              >
                <LuTrash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        ))}
      </div>

      <Row label="Paid Amount (পরিশোধিত):">
        <span className="flex items-center gap-2">
          {paid !== grandTotal && grandTotal > 0 && (
            <button type="button" onClick={onPayFull} className="text-xs font-semibold text-indigo-600 hover:underline">
              Full
            </button>
          )}
          <span className="w-36 rounded-md bg-green-50 px-3 py-2 text-right text-sm font-bold text-green-700">{formatTaka(paid)}</span>
        </span>
      </Row>
      <Row label="Due Amount (বকেয়া):">
        <span className={`w-36 rounded-md px-3 py-2 text-right text-sm font-bold ${due > 0 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-900"}`}>
          {formatTaka(due)}
        </span>
      </Row>

      <Button onClick={onSubmit} loading={submitting} disabled={disabled} className="w-full py-3 text-base">
        Complete Sale ({formatTaka(grandTotal)})
      </Button>
    </section>
  );
};

export default PosOrderSummary;
