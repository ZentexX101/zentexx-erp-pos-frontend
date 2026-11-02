import { formatTaka } from "../../utils/money";
import { toDecimalInput } from "../../utils/number";
import Button from "../common/buttons/Button";
import CompactPaymentRows from "../sale/CompactPaymentRows";

const Row = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-sm font-semibold text-slate-700">{label}</span>
    {children}
  </div>
);

const box = "w-36 rounded-md px-3 py-2 text-right text-sm font-bold";

// New items total − discount − old device value = payable. When the old devices are worth more,
// the difference is paid out to the customer (or left on their balance).
const ExchangeSummary = ({ itemCount, subTotal, discount, onDiscount, exchangeValue, payable, payments, onPayments, methods, settled, onSettleFull, submitLabel, onSubmit, submitting }) => {
  const weOwe = payable < 0;
  const left = Math.round((Math.abs(payable) - settled) * 100) / 100;

  return (
    <section className="space-y-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">
          Exchange Summary <span className="text-xs font-normal text-indigo-500">(এক্সচেঞ্জ হিসাব)</span>
        </h2>
        <span className="text-xs font-semibold text-slate-500">New Items: {itemCount}</span>
      </div>

      <Row label="New Product Total (মোট):">
        <span className={`${box} bg-slate-50 text-slate-900`}>{formatTaka(subTotal)}</span>
      </Row>
      <Row label="Discount on New (ছাড়):">
        <input
          inputMode="decimal"
          aria-label="Discount"
          value={discount}
          onChange={(e) => onDiscount(toDecimalInput(e.target.value))}
          placeholder="0"
          className={`${box} border border-slate-300 bg-white font-semibold outline-none focus:ring-2 focus:ring-brand/10`}
        />
      </Row>
      <Row label="− Exchange Value (বাইব্যাক মান):">
        <span className={`${box} bg-green-50 text-green-700`}>{formatTaka(exchangeValue)}</span>
      </Row>

      <div className={`flex items-center justify-between rounded-xl px-4 py-3 text-white ${weOwe ? "bg-orange-600" : "bg-slate-900"}`}>
        <span className="font-bold">{weOwe ? "WE PAY CUSTOMER (ফেরত দিতে হবে):" : "PAYABLE AMOUNT (পরিশোধযোগ্য):"}</span>
        <span className="text-xl font-bold">{formatTaka(Math.abs(payable))}</span>
      </div>

      {payable !== 0 && (
        <>
          <CompactPaymentRows
            title={weOwe ? "Pay out through" : "Payment Methods"}
            lines={payments}
            onChange={onPayments}
            methods={methods}
            tone={weOwe ? "orange" : "green"}
          />
          <Row label={weOwe ? "Paid out now:" : "Paid Amount (পরিশোধিত):"}>
            <span className="flex items-center gap-2">
              {settled !== Math.abs(payable) && (
                <button type="button" onClick={onSettleFull} className="text-xs font-semibold text-indigo-600 hover:underline">
                  Full
                </button>
              )}
              <span className={`${box} ${weOwe ? "bg-orange-50 text-orange-700" : "bg-green-50 text-green-700"}`}>{formatTaka(settled)}</span>
            </span>
          </Row>
          <Row label={weOwe ? "Left on customer's balance:" : "Due Amount (বকেয়া):"}>
            <span className={`${box} ${left > 0 && !weOwe ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-900"}`}>{formatTaka(left)}</span>
          </Row>
        </>
      )}

      <Button onClick={onSubmit} loading={submitting} className="w-full py-3 text-base">
        {submitLabel}
      </Button>
    </section>
  );
};

export default ExchangeSummary;
