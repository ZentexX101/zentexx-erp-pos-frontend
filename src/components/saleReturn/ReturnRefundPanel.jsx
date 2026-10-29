import { formatTaka } from "../../utils/money";
import { roundTaka } from "../../utils/number";
import Button from "../common/buttons/Button";
import Textarea from "../common/forms/Textarea";
import PaymentMethodLines from "../payment/PaymentMethodLines";

// The return value, the cash given back now (one or more payment methods) and what stays on the
// customer's balance. Walk-in customers get it all back.
const ReturnRefundPanel = ({ sale, total, refund, suggested, lines, onLines, onSuggest, methods, note, onNote, onSubmit, submitting }) => {
  const adjusted = roundTaka(total - refund);

  return (
    <section className="space-y-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
      <PaymentMethodLines
        lines={lines}
        onChange={onLines}
        methods={methods}
        checkBalance
        title="Refund (money given back now)"
        addLabel="Add Payment Method"
        totalLabel="Total Refund"
        tone="text-orange-600"
        footer={
          total > 0 &&
          refund !== suggested && (
            <button type="button" onClick={onSuggest} className="text-xs font-semibold text-indigo-600 hover:underline">
              Use suggested refund {formatTaka(suggested)}
            </button>
          )
        }
      />

      <dl className="grid gap-3 rounded-lg bg-slate-50 p-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs text-slate-500">Return total</dt>
          <dd className="text-lg font-bold text-slate-900">{formatTaka(total)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Refunded now</dt>
          <dd className="text-lg font-bold text-orange-600">{formatTaka(refund)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">{sale.customer ? "Adjusted on customer balance" : "Must be refunded"}</dt>
          <dd className={`text-lg font-bold ${adjusted > 0 && !sale.customer ? "text-red-600" : "text-slate-900"}`}>{formatTaka(adjusted)}</dd>
        </div>
      </dl>
      {sale.customer && adjusted > 0 && (
        <p className="text-xs text-slate-500">{formatTaka(adjusted)} lowers what {sale.customer.name} owes (or becomes their advance).</p>
      )}

      <Textarea label="Note" placeholder="Why is it coming back?" maxLength={500} value={note} onChange={(e) => onNote(e.target.value)} />

      <Button onClick={onSubmit} loading={submitting} disabled={total <= 0} className="w-full py-3 text-base">
        Complete Return ({formatTaka(total)})
      </Button>
    </section>
  );
};

export default ReturnRefundPanel;
