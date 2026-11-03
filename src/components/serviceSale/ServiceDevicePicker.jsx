import { LuCheck, LuSmartphone } from "react-icons/lu";
import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { formatPhone } from "../../utils/phone";
import Badge from "../common/data/Badge";

const Field = ({ label, children }) => (
  <div className="min-w-0">
    <dt className="text-xs text-slate-500">{label}</dt>
    <dd className="truncate font-medium text-slate-900">{children}</dd>
  </div>
);

// The found invoice and its devices (one row per IMEI, one per other line). Pick the device that gets
// the service; the services each already has are shown as badges. serviceNames: { id: name }.
const ServiceDevicePicker = ({ sale, rows, picked, onPick, serviceNames }) => (
  <section className="space-y-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 sm:p-5">
    <dl className="grid gap-4 sm:grid-cols-3">
      <Field label="Invoice">
        <span className="font-mono">{sale.invoiceNo}</span>
        <span className="block text-xs font-normal text-slate-500">{formatDateTime(sale.date)}</span>
      </Field>
      <Field label="Customer">
        {sale.customer?.name ?? "Walk-in customer"}
        {sale.customer && <span className="block text-xs font-normal text-slate-500">{formatPhone(sale.customer.phone)}</span>}
      </Field>
      <Field label="Sold by">{sale.soldBy?.name ?? "—"}</Field>
    </dl>

    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Pick the device</p>
      {rows.length === 0 ? (
        <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">Every piece on this invoice was returned.</p>
      ) : (
        <ul className="space-y-2" role="radiogroup" aria-label="Device">
          {rows.map((row) => {
            const active = picked === row.key;
            const has = row.serial ? row.services : [];
            return (
              <li key={row.key}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onPick(row.key)}
                  className={`flex w-full min-w-0 items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                    active ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                  }`}
                >
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${active ? "bg-brand text-white" : "bg-slate-100 text-slate-500"}`}
                    aria-hidden="true"
                  >
                    {active ? <LuCheck className="size-4" /> : <LuSmartphone className="size-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold uppercase text-slate-900">{row.device.name}</span>
                    <span className="block truncate font-mono text-xs text-slate-500">{row.serial ?? `${row.quantity} pcs kept`}</span>
                    {has.length > 0 && (
                      <span className="mt-1 flex flex-wrap gap-1">
                        {has.map((id) => (
                          <Badge key={id} tone="green">
                            {serviceNames[id] ?? "Service"}
                          </Badge>
                        ))}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-[11px] text-slate-500">Sold at</span>
                    <span className="block text-sm font-semibold tabular-nums text-slate-900">{formatTaka(row.device.unitPrice)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  </section>
);

export default ServiceDevicePicker;
