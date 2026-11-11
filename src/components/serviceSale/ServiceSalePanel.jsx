import { formatTaka } from "../../utils/money";
import { roundTaka, toDecimalInput, toIntegerInput } from "../../utils/number";
import { servicePrice } from "../../utils/serviceSale";
import Button from "../common/buttons/Button";
import Input from "../common/forms/Input";
import Select from "../common/forms/Select";
import Textarea from "../common/forms/Textarea";
import PaymentMethodLines from "../payment/PaymentMethodLines";

const Row = ({ label, value, className = "text-slate-900", strong }) => (
  <div className="flex items-center justify-between gap-3">
    <dt className="text-slate-500">{label}</dt>
    <dd className={`tabular-nums ${strong ? "text-base font-bold" : "font-semibold"} ${className}`}>{value}</dd>
  </div>
);

// The service for the picked device: which service (only those it can still get), pieces (non-IMEI),
// the price worked out from the device price, discount, payment and the seller.
// form: { service, quantity, discount, soldBy, note }; onField(name, value)
const ServiceSalePanel = ({ row, options, form, onField, maths, left, lines, onLines, methods, staff, onSubmit, submitting, walkIn }) => {
  const { price, incentive, total, paid } = maths;
  const due = roundTaka(total - paid);
  const service = options.find((s) => s._id === form.service);

  return (
    <section className="space-y-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 sm:p-5">
      {/* Services as choices in the panel (a native dropdown grew as wide as the longest name and spilled out) */}
      <fieldset disabled={!row} className="min-w-0">
        <legend className="mb-1.5 text-sm font-medium text-slate-700">
          Service <span className="text-red-500">*</span>
        </legend>
        {!row ? (
          <p className="rounded-lg border border-dashed border-slate-300 px-3 py-3 text-sm text-slate-500">Pick a device first.</p>
        ) : !options.length ? (
          <p className="rounded-lg bg-amber-50 px-3 py-3 text-sm text-amber-800">No service left for this device.</p>
        ) : (
          <div role="radiogroup" aria-label="Service" className="max-h-72 space-y-2 overflow-y-auto pr-0.5">
            {options.map((option) => {
              const picked = form.service === option._id;
              const price = servicePrice(row.device.unitPrice, option.pricePercent);
              return (
                <button
                  key={option._id}
                  type="button"
                  role="radio"
                  aria-checked={picked}
                  onClick={() => onField("service", picked ? "" : option._id)}
                  className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left ring-1 ring-inset transition ${
                    picked ? "bg-slate-900 text-white ring-slate-900" : "bg-white ring-slate-200 hover:bg-slate-50 hover:ring-slate-300"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full ring-2 ring-inset ${picked ? "bg-white ring-white" : "ring-slate-300"}`}
                    aria-hidden="true"
                  >
                    {picked && <span className="size-2 rounded-full bg-slate-900" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-sm font-semibold leading-snug">{option.name}</span>
                    <span className={`mt-1 flex flex-wrap gap-1.5 text-[11px] font-semibold ${picked ? "text-slate-300" : "text-slate-500"}`}>
                      <span className={`rounded-full px-2 py-0.5 ${picked ? "bg-white/10" : "bg-blue-50 text-blue-700"}`}>{option.pricePercent}% of price</span>
                      <span className={`rounded-full px-2 py-0.5 ${picked ? "bg-white/10" : "bg-amber-50 text-amber-800"}`}>
                        {option.incentivePercent}% incentive
                      </span>
                    </span>
                  </span>
                  <span className={`shrink-0 text-sm font-bold tabular-nums ${picked ? "text-emerald-300" : "text-slate-900"}`}>{formatTaka(price)}</span>
                </button>
              );
            })}
          </div>
        )}
      </fieldset>

      {row && !row.serial && (
        <Input
          label={`Pieces (up to ${left})`}
          inputMode="numeric"
          value={form.quantity}
          onChange={(e) => onField("quantity", toIntegerInput(e.target.value))}
        />
      )}

      {service && (
        <dl className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
          <Row
            label={`Device price ${formatTaka(row.device.unitPrice)} × ${service.pricePercent}%${row.serial ? "" : ` × ${Number(form.quantity) || 0}`}`}
            value={formatTaka(price)}
          />
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="service-discount" className="text-slate-500">
              Discount
            </label>
            <input
              id="service-discount"
              inputMode="decimal"
              value={form.discount}
              onChange={(e) => onField("discount", toDecimalInput(e.target.value))}
              placeholder="0"
              className="w-28 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-right text-sm font-semibold outline-none focus:border-slate-400 focus:ring-2 focus:ring-brand/10"
            />
          </div>
          <div className="border-t border-slate-200 pt-2">
            <Row label="Total" value={formatTaka(total)} strong />
          </div>
          <Row label={`Seller incentive (${service.incentivePercent}%)`} value={formatTaka(incentive)} className="text-amber-700" />
        </dl>
      )}

      {service && total > 0 && (
        <PaymentMethodLines lines={lines} onChange={onLines} methods={methods} title="Payment" addLabel="Add Method" totalLabel="Paid" tone="text-green-600" />
      )}

      {service && total > 0 && (
        <div className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm ${due > 0 ? "bg-red-50" : "bg-green-50"}`}>
          <span className={due > 0 ? "text-red-700" : "text-green-700"}>
            {due > 0 ? (walkIn ? "Walk-in: must be paid in full" : "Due (on the customer)") : "Fully paid"}
          </span>
          <span className={`font-bold tabular-nums ${due > 0 ? "text-red-700" : "text-green-700"}`}>{formatTaka(Math.max(due, 0))}</span>
        </div>
      )}

      <Select
        label="Sold by"
        options={staff.map((member) => ({ value: member._id, label: member.name }))}
        value={form.soldBy}
        onChange={(e) => onField("soldBy", e.target.value)}
      />
      <Textarea label="Note" maxLength={500} value={form.note} onChange={(e) => onField("note", e.target.value)} />

      <Button onClick={onSubmit} loading={submitting} disabled={!service} className="w-full py-3 text-base">
        Complete Service Sale{service ? ` (${formatTaka(total)})` : ""}
      </Button>
    </section>
  );
};

export default ServiceSalePanel;
