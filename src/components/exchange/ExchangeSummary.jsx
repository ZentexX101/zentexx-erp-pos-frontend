import { LuReceipt } from "react-icons/lu";
import { formatTaka } from "../../utils/money";
import { toDecimalInput } from "../../utils/number";
import Button from "../common/buttons/Button";
import CompactPaymentRows from "../sale/CompactPaymentRows";
import ExchangePanel from "./ExchangePanel";

// One line of the bill: English label, Bangla under it, the amount on the right
const Row = ({ label, bn, children }) => (
  <div className="flex items-center justify-between gap-3 py-2.5">
    <span className="min-w-0">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      {bn && <span className="block text-[11px] text-slate-400">{bn}</span>}
    </span>
    {children}
  </div>
);

const amount = "text-right text-sm font-semibold tabular-nums";

// New items total − discount − old device value = payable. When the old devices are worth more,
// the difference is paid out to the customer (or left on their balance).
const ExchangeSummary = ({ itemCount, subTotal, discount, onDiscount, exchangeValue, payable, payments, onPayments, methods, settled, onSettleFull, submitLabel, onSubmit, submitting }) => {
  const weOwe = payable < 0;
  const left = Math.round((Math.abs(payable) - settled) * 100) / 100;

  return (
    <ExchangePanel
      icon={LuReceipt}
      title="Exchange Summary"
      bn="(এক্সচেঞ্জ হিসাব)"
      aside={<span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">New items: {itemCount}</span>}
    >
      <div className="divide-y divide-slate-100">
        <Row label="New Product Total" bn="মোট">
          <span className={`${amount} text-slate-900`}>{formatTaka(subTotal)}</span>
        </Row>
        <Row label="Discount on New" bn="ছাড়">
          <span className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">− ৳</span>
            <input
              inputMode="decimal"
              aria-label="Discount"
              value={discount}
              onChange={(e) => onDiscount(toDecimalInput(e.target.value))}
              placeholder="0"
              className="w-36 rounded-md border border-slate-300 bg-white py-1.5 pl-9 pr-3 text-right text-sm font-semibold tabular-nums outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-brand/10"
            />
          </span>
        </Row>
        <Row label="Exchange Value" bn="বাইব্যাক মান (old devices)">
          <span className={`${amount} text-emerald-600`}>− {formatTaka(exchangeValue)}</span>
        </Row>
      </div>

      <div
        className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 text-white shadow-sm ${
          weOwe ? "bg-gradient-to-r from-orange-600 to-orange-500" : "bg-gradient-to-r from-slate-900 to-slate-700"
        }`}
      >
        <span className="min-w-0">
          <span className="block text-xs font-semibold uppercase tracking-wider">{weOwe ? "We pay customer" : "Payable amount"}</span>
          <span className="block text-[11px] text-white/70">{weOwe ? "ফেরত দিতে হবে" : "পরিশোধযোগ্য"}</span>
        </span>
        <span className="text-2xl font-bold tabular-nums">{formatTaka(Math.abs(payable))}</span>
      </div>

      {payable !== 0 && (
        <>
          <CompactPaymentRows
            title={weOwe ? "Pay out through" : "Payment Methods"}
            lines={payments}
            onChange={onPayments}
            methods={methods}
            tone={weOwe ? "orange" : "green"}
            total={Math.abs(payable)}
            withTxnId
          />
          <div className="grid grid-cols-2 gap-2">
            <div className={`rounded-lg px-3 py-2 ring-1 ring-inset ${weOwe ? "bg-orange-50 ring-orange-200" : "bg-emerald-50 ring-emerald-200"}`}>
              <p className="flex items-center justify-between gap-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                {weOwe ? "Paid out now" : "Paid · পরিশোধিত"}
                {settled !== Math.abs(payable) && (
                  <button type="button" onClick={onSettleFull} className="normal-case tracking-normal font-semibold text-indigo-600 hover:underline">
                    Full
                  </button>
                )}
              </p>
              <p className={`mt-0.5 text-base font-bold tabular-nums ${weOwe ? "text-orange-700" : "text-emerald-700"}`}>{formatTaka(settled)}</p>
            </div>
            <div className={`rounded-lg px-3 py-2 ring-1 ring-inset ${left > 0 && !weOwe ? "bg-red-50 ring-red-200" : "bg-slate-50 ring-slate-200"}`}>
              <p className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-500">{weOwe ? "Left on balance" : "Due · বকেয়া"}</p>
              <p className={`mt-0.5 text-base font-bold tabular-nums ${left > 0 && !weOwe ? "text-red-600" : "text-slate-900"}`}>{formatTaka(left)}</p>
            </div>
          </div>
        </>
      )}

      <Button onClick={onSubmit} loading={submitting} className="w-full py-3 text-base">
        {submitLabel}
      </Button>
    </ExchangePanel>
  );
};

export default ExchangeSummary;
