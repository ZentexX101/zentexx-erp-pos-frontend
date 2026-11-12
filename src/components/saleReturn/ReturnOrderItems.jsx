import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { toIntegerInput } from "../../utils/number";
import { formatPhone } from "../../utils/phone";
import { pickQuantity, returnableQuantity, returnableSerials, returnUnitPrice } from "../../utils/saleReturn";
import Badge from "../common/data/Badge";

const Field = ({ label, children }) => (
  <div>
    <dt className="text-xs text-slate-500">{label}</dt>
    <dd className="font-medium text-slate-900">{children}</dd>
  </div>
);

// The found order and its items: tick IMEIs or enter a quantity to return.
// picks: { [productId]: { quantity, serials } }; onPick(productId, next pick)
const ReturnOrderItems = ({ sale, picks, onPick }) => (
  <section className="space-y-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
    <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Field label="Order">
        <span className="font-mono">{sale.invoiceNo}</span>
        <span className="block text-xs font-normal text-slate-500">{formatDateTime(sale.date)}</span>
      </Field>
      <Field label="Customer">
        {sale.customer?.name ?? "Walk-in customer"}
        {sale.customer && <span className="block text-xs font-normal text-slate-500">{formatPhone(sale.customer.phone)}</span>}
      </Field>
      <Field label="Sold by">{sale.soldBy?.name ?? "—"}</Field>
      <Field label="Grand total">
        {formatTaka(sale.grandTotal)}
        {sale.discount > 0 && <span className="block text-xs font-normal text-slate-500">Discount {formatTaka(sale.discount)} shared over items</span>}
      </Field>
    </dl>

    {/* Sized by its own box (it sits in a narrow column on desktop): narrow = return controls under the
        product; from @lg a Return column; from @3xl also the Sold / Returned column */}
    <div className="@container">
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 font-semibold">Product</th>
              <th className="hidden whitespace-nowrap px-3 py-2 font-semibold @3xl:table-cell">Sold / Returned</th>
              <th className="hidden px-3 py-2 font-semibold @lg:table-cell @lg:w-56">Return</th>
              <th className="px-3 py-2 text-right font-semibold">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sale.items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-sm text-slate-500">
                  {sale.externalItems?.length
                    ? "This order only has external products (not from our stock), so there is nothing to return here."
                    : "This order has no items to return."}
                </td>
              </tr>
            )}
            {sale.items.map((item) => {
              const pick = picks[item.product] ?? { quantity: "", serials: [] };
              const unitPrice = returnUnitPrice(sale, item);
              const left = returnableQuantity(item);
              const set = (next) => onPick(item.product, { ...pick, ...next });
              const controls =
                left === 0 ? (
                  <Badge tone="slate">Fully returned</Badge>
                ) : item.trackSerial ? (
                  <div className="space-y-1.5">
                    {returnableSerials(item).map((serial) => (
                      <label key={serial} className="flex cursor-pointer items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={pick.serials.includes(serial)}
                          onChange={() =>
                            set({ serials: pick.serials.includes(serial) ? pick.serials.filter((s) => s !== serial) : [...pick.serials, serial] })
                          }
                          className="size-4 rounded border-slate-300"
                        />
                        <span className="break-all font-mono">{serial}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      inputMode="numeric"
                      aria-label={`Return quantity of ${item.name}`}
                      placeholder="0"
                      value={pick.quantity}
                      onChange={(e) => set({ quantity: toIntegerInput(e.target.value) })}
                      className="w-20 rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-brand/10"
                    />
                    <span className="text-xs text-slate-500">of {left}</span>
                  </div>
                );
              return (
                <tr key={item.product} className="align-top">
                  <td className="px-3 py-2.5">
                    <p className="font-medium uppercase text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">{formatTaka(unitPrice)} per piece paid</p>
                    {item.services?.length > 0 && (
                      <p className="text-xs text-emerald-700">Incl. {item.services.map((row) => row.name).join(", ")} (refunded with it)</p>
                    )}
                    <p className="text-xs text-slate-500 @3xl:hidden">
                      Sold {item.quantity} · returned {item.returnedQuantity}
                    </p>
                    {/* Narrow: what to return sits right here */}
                    <div className="mt-2 @lg:hidden">{controls}</div>
                  </td>
                  <td className="hidden px-3 py-2.5 text-slate-600 @3xl:table-cell">
                    {item.quantity} / {item.returnedQuantity}
                  </td>
                  <td className="hidden px-3 py-2.5 @lg:table-cell">{controls}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold text-slate-900">
                    {formatTaka(unitPrice * pickQuantity(item, pick))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

export default ReturnOrderItems;
