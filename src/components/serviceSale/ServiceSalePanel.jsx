import { formatTaka } from "../../utils/money";
import { roundTaka, toDecimalInput, toIntegerInput } from "../../utils/number";
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
      <Select
        label="Service"
        required
        placeholder={options.length ? "Select a service" : "No service left for this device"}
        options={options.map((s) => ({ value: s._id, label: `${s.name} · ${s.pricePercent}%` }))}
        value={form.service}
        onChange={(e) => onField("service", e.target.value)}
        disabled={!row || !options.length}
      />

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
