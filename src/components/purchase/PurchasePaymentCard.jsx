import { usePaymentMethodOptionsData } from "../../hooks/usePaymentMethodApi";
import { formatTaka } from "../../utils/money";
import { toDecimalInput } from "../../utils/number";
import Input from "../common/forms/Input";
import Select from "../common/forms/Select";
import Textarea from "../common/forms/Textarea";

// What's paid now (and from which payment method) plus the note. The rest becomes supplier due.
// payment: { paidAmount, paymentMethod, note } as strings; onChange(field, value)
const PurchasePaymentCard = ({ total, payment, onChange }) => {
  const { data: methods = [] } = usePaymentMethodOptionsData();
  const method = methods.find((m) => m._id === payment.paymentMethod);
  const paid = Number(payment.paidAmount) || 0;

  const options = methods.map((m) => ({ value: m._id, label: `${m.name} (${formatTaka(m.balance)})` }));

  return (
    <section className="grid gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Payment</p>
          <h2 className="text-lg font-semibold text-slate-900">Paid Now</h2>
        </div>
        <Input
          label="Paid Amount (৳)"
          inputMode="decimal"
          placeholder="0 = all due"
          value={payment.paidAmount}
          onChange={(e) => onChange("paidAmount", toDecimalInput(e.target.value))}
          labelAside={
            total > 0 && (
              <button type="button" onClick={() => onChange("paidAmount", String(total))} className="text-xs font-semibold text-indigo-600 hover:underline">
                Pay full {formatTaka(total)}
              </button>
            )
          }
        />
        <div>
          <Select
            label="Payment Method"
            required={paid > 0}
            placeholder={methods.length ? "Select payment method" : "No active payment method"}
            options={options}
            value={payment.paymentMethod}
            onChange={(e) => onChange("paymentMethod", e.target.value)}
            disabled={paid === 0}
          />
          {method && paid > method.balance && (
            <p className="mt-1 text-xs text-red-600">
              {method.name} has only {formatTaka(method.balance)}.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Note / Remarks</p>
          <h2 className="text-lg font-semibold text-slate-900">Payment Note</h2>
        </div>
        <Textarea
          placeholder="Write purchase or payment note"
          maxLength={500}
          rows={5}
          value={payment.note}
          onChange={(e) => onChange("note", e.target.value)}
        />
      </div>
    </section>
  );
};

export default PurchasePaymentCard;
