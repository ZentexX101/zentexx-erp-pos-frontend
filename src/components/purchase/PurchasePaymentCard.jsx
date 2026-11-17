import { LuStickyNote } from "react-icons/lu";
import { usePaymentMethodOptionsData } from "../../hooks/usePaymentMethodApi";
import { formatTaka } from "../../utils/money";
import { roundTaka, toDecimalInput } from "../../utils/number";
import Input from "../common/forms/Input";
import Select from "../common/forms/Select";
import Textarea from "../common/forms/Textarea";
import { SectionHeading } from "./PickerCard";

const chipClass =
  "rounded-full border px-2.5 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

// What's paid now (and from which payment method) plus the note. The rest becomes supplier due.
// payment: { paidAmount, paymentMethod, note } as strings; onChange(field, value)
const PurchasePaymentCard = ({ total, payment, onChange, step }) => {
  const { data: methods = [] } = usePaymentMethodOptionsData();
  const paid = Number(payment.paidAmount) || 0;
  const due = roundTaka(total - paid);

  const options = methods.map((m) => ({ value: m._id, label: m.name }));

  // Quick fills: nothing paid, half, or all of it
  const quick = [
    { label: "All due", value: "" },
    { label: "Half", value: total > 0 ? String(roundTaka(total / 2)) : "" },
    { label: "Pay full", value: total > 0 ? String(total) : "" },
  ];

  return (
    <section className="grid overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 lg:grid-cols-2">
      <div className="space-y-4 p-4 sm:p-5">
        <SectionHeading step={step} eyebrow="Payment" title="Paid Now" />

        <div>
          <Input
            label="Paid Amount (৳)"
            inputMode="decimal"
            placeholder="0 = all due"
            value={payment.paidAmount}
            onChange={(e) =>
              onChange("paidAmount", toDecimalInput(e.target.value))
            }
          />
          {total > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {quick.map((q) => {
                const active =
                  (Number(payment.paidAmount) || 0) === (Number(q.value) || 0);
                return (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => onChange("paidAmount", q.value)}
                    className={`${chipClass} ${
                      active
                        ? "border-brand bg-brand text-white"
                        : "border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900"
                    }`}
                  >
                    {q.label}
                  </button>
                );
              })}
              <span
                className={`ml-auto text-xs font-medium ${due > 0 ? "text-red-600" : due < 0 ? "text-amber-600" : "text-emerald-600"}`}
              >
                {due > 0
                  ? `${formatTaka(due)} goes to supplier due`
                  : due < 0
                    ? "More than the total"
                    : "Fully paid"}
              </span>
            </div>
          )}
        </div>

        <Select
          label="Payment Method"
          required={paid > 0}
          placeholder={
            paid === 0
              ? "Not needed while nothing is paid"
              : methods.length
                ? "Select payment method"
                : "No active payment method"
          }
          options={options}
          value={payment.paymentMethod}
          onChange={(e) => onChange("paymentMethod", e.target.value)}
          disabled={paid === 0}
        />
      </div>

      <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5 lg:border-l lg:border-t-0">
        <SectionHeading
          icon={LuStickyNote}
          eyebrow="Note / Remarks"
          title="Purchase Note"
        />
        <Textarea
          className="flex flex-1 flex-col [&_textarea]:min-h-24 [&_textarea]:flex-1 [&_textarea]:resize-none"
          placeholder="Write purchase or payment note (optional)"
          maxLength={500}
          rows={4}
          value={payment.note}
          onChange={(e) => onChange("note", e.target.value)}
        />
      </div>
    </section>
  );
};

export default PurchasePaymentCard;
