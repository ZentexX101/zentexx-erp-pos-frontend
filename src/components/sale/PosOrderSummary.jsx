import { formatTaka } from "../../utils/money";
import { toDecimalInput } from "../../utils/number";
import Button from "../common/buttons/Button";
import CompactPaymentRows from "./CompactPaymentRows";

// Every value box is the same size, so the column lines up
const boxClass = "h-10 w-32 rounded-lg px-3 text-right text-sm sm:w-36";
const amountClass = `${boxClass} border border-slate-300 bg-white font-semibold text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-brand/10`;

// English label with the Bangla under it (one tidy line each, instead of wrapping mid-label)
const Row = ({ label, bn, children }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="min-w-0 leading-tight">
      <span className="block text-sm font-semibold text-slate-700">{label}</span>
      <span className="block text-[11px] text-slate-400">{bn}</span>
    </span>
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
  return (
    <section className="space-y-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">
          Order Summary <span className="text-xs font-normal text-indigo-500">(অর্ডার হিসাব)</span>
        </h2>
        <span className="text-xs font-semibold text-slate-500">Items: {itemCount}</span>
      </div>

      <Row label="Sub Total" bn="মোট">
        <span className={`${boxClass} flex items-center justify-end bg-slate-50 font-bold text-slate-900`}>{formatTaka(subTotal)}</span>
      </Row>
      <Row label="Discount" bn="ছাড়">
        <input
          inputMode="decimal"
          aria-label="Discount"
          value={discount}
          onChange={(e) => onAmount("discount", toDecimalInput(e.target.value))}
          placeholder="0"
          className={amountClass}
        />
      </Row>
      <Row label="Delivery Charge" bn="ডেলিভারি চার্জ">
        <input
          inputMode="decimal"
          aria-label="Delivery charge"
          value={deliveryCharge}
          onChange={(e) => onAmount("deliveryCharge", toDecimalInput(e.target.value))}
          placeholder="0"
          className={amountClass}
        />
      </Row>

      <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-900 px-4 py-3 text-white">
        <span className="leading-tight">
          <span className="block font-bold tracking-wide">GRAND TOTAL</span>
          <span className="block text-[11px] text-slate-400">সর্বমোট</span>
        </span>
        <span className="text-xl font-bold tabular-nums text-green-400 sm:text-2xl">{formatTaka(grandTotal)}</span>
      </div>

      <CompactPaymentRows title="Payment Methods" lines={payments} onChange={onPayments} methods={methods} total={grandTotal} withTxnId />

      {/* Paid and due side by side */}
      <div className="grid grid-cols-2 gap-2">
        <div className="min-w-0 rounded-xl bg-green-50 px-3 py-2.5 ring-1 ring-inset ring-green-100">
          <p className="flex items-center justify-between gap-2 text-xs font-medium text-green-800">
            <span>
              Paid <span className="text-green-700/70">· পরিশোধিত</span>
            </span>
            {paid !== grandTotal && grandTotal > 0 && (
              <button type="button" onClick={onPayFull} className="font-semibold text-indigo-600 hover:underline">
                Pay full
              </button>
            )}
          </p>
          <p className="mt-0.5 break-all text-base font-bold tabular-nums text-green-700">{formatTaka(paid)}</p>
        </div>
        <div className={`min-w-0 rounded-xl px-3 py-2.5 ring-1 ring-inset ${due > 0 ? "bg-red-50 ring-red-100" : "bg-slate-50 ring-slate-100"}`}>
          <p className={`text-xs font-medium ${due > 0 ? "text-red-800" : "text-slate-500"}`}>
            Due <span className="opacity-70">· বকেয়া</span>
          </p>
          <p className={`mt-0.5 break-all text-base font-bold tabular-nums ${due > 0 ? "text-red-600" : "text-slate-900"}`}>{formatTaka(due)}</p>
        </div>
      </div>

      <Button onClick={onSubmit} loading={submitting} disabled={disabled} className="h-12 w-full text-base">
        Complete Sale ({formatTaka(grandTotal)})
      </Button>
    </section>
  );
};

export default PosOrderSummary;
