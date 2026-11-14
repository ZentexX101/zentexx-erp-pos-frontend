import { Fragment } from "react";
import { LuPrinter } from "react-icons/lu";
import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { formatPhone } from "../../utils/phone";
import { variantDetails } from "../../utils/productVariant";
import Button from "../common/buttons/Button";
import Modal from "../common/modals/Modal";

const Field = ({ label, children, className = "" }) => (
  <div className={className}>
    <dt className="text-xs text-slate-500">{label}</dt>
    <dd className="font-medium text-slate-900">{children}</dd>
  </div>
);

// One sale: items with IMEIs, totals, payments, and profit (canSeeProfit) — with "Print Invoice"
const SaleDetailsModal = ({ sale, canSeeProfit, onPrint, onClose }) => (
  <Modal
    isOpen={Boolean(sale)}
    onClose={onClose}
    title={`Invoice ${sale?.invoiceNo ?? ""}`}
    subtitle={sale && formatDateTime(sale.date)}
    size="xl"
    footer={
      sale && (
        <Button onClick={() => onPrint(sale)}>
          <LuPrinter className="h-4 w-4" aria-hidden="true" />
          Print Invoice
        </Button>
      )
    }
  >
    {sale && (
      <div className="space-y-5">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Customer">
            {sale.customer?.name ?? "Walk-in customer"}
            {sale.customer && <span className="block text-xs font-normal text-slate-500">{formatPhone(sale.customer.phone)}</span>}
          </Field>
          <Field label="Sold by">{sale.soldBy?.name ?? "—"}</Field>
          <Field label="Paid with" className="col-span-2 sm:col-span-1">
            {[
              ...sale.payments.map((line) => `${line.paymentMethod?.name} ${formatTaka(line.amount)}${line.txnId ? ` (Txn: ${line.txnId})` : ""}`),
              ...(sale.advanceAmount > 0 ? [`Advance ${formatTaka(sale.advanceAmount)} (${sale.preOrderNo})`] : []),
            ].join(", ") || "—"}
          </Field>
        </dl>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm sm:min-w-[520px]">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2 font-semibold">
                  <span className="flex justify-between gap-3">
                    Product
                    <span className="sm:hidden">Total</span>
                  </span>
                </th>
                <th className="hidden px-3 py-2 text-right font-semibold sm:table-cell">Qty</th>
                <th className="hidden px-3 py-2 text-right font-semibold sm:table-cell">Price</th>
                <th className="hidden px-3 py-2 text-right font-semibold sm:table-cell">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sale.items.map((item) => (
                <Fragment key={item.product}>
                <tr className="align-top">
                  <td className="px-3 py-2">
                    {/* Phones: the total sits on the name line (the Total column is hidden), so the details get the full width */}
                    <p className="flex items-start justify-between gap-3">
                      <span className="min-w-0 font-medium text-slate-900">{item.name}</span>
                      <span className="shrink-0 font-semibold tabular-nums text-slate-900 sm:hidden">{formatTaka(item.total)}</span>
                    </p>
                    <p className="text-xs tabular-nums text-slate-500 sm:hidden">
                      {item.quantity} × {formatTaka(item.unitPrice)}
                    </p>
                    {variantDetails(item.variant) && <p className="text-xs text-slate-500">{variantDetails(item.variant)}</p>}
                    {item.serials.length > 0 && <p className="break-all font-mono text-xs text-slate-500">IMEI: {item.serials.join(", ")}</p>}
                    {item.productCode && <p className="break-all font-mono text-xs text-slate-500">IMEI / ID: {item.productCode}</p>}
                    {item.returnedQuantity > 0 && (
                      <p className="text-xs font-semibold text-orange-600">
                        Returned: {item.returnedQuantity}
                        {item.returnedSerials.length > 0 && ` (${item.returnedSerials.join(", ")})`}
                      </p>
                    )}
                  </td>
                  <td className="hidden px-3 py-2 text-right sm:table-cell">{item.quantity}</td>
                  <td className="hidden whitespace-nowrap px-3 py-2 text-right sm:table-cell">{formatTaka(item.unitPrice)}</td>
                  <td className="hidden whitespace-nowrap px-3 py-2 text-right font-semibold sm:table-cell">{formatTaka(item.total)}</td>
                </tr>
                {/* Services sold with the product (each covers every piece of it) */}
                {(item.services ?? []).map((row) => (
                  <tr key={`${item.product}-${row.service}`} className="align-top bg-emerald-50/40">
                    <td className="py-2 pl-6 pr-3">
                      <p className="flex items-start justify-between gap-3">
                        <span className="min-w-0 font-medium text-emerald-800">↳ {row.name}</span>
                        <span className="shrink-0 font-semibold tabular-nums text-slate-900 sm:hidden">{formatTaka(row.price)}</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        <span className="tabular-nums sm:hidden">{row.quantity} × {formatTaka(row.unitPrice)} · </span>
                        {row.pricePercent}% of the selling price
                      </p>
                    </td>
                    <td className="hidden px-3 py-2 text-right sm:table-cell">{row.quantity}</td>
                    <td className="hidden whitespace-nowrap px-3 py-2 text-right sm:table-cell">{formatTaka(row.unitPrice)}</td>
                    <td className="hidden whitespace-nowrap px-3 py-2 text-right font-semibold sm:table-cell">{formatTaka(row.price)}</td>
                  </tr>
                ))}
                </Fragment>
              ))}
              {(sale.externalItems ?? []).map((item, i) => (
                <tr key={`external-${i}`} className="align-top">
                  <td className="px-3 py-2">
                    {/* Phones: the total sits on the name line (the Total column is hidden), so the details get the full width */}
                    <p className="flex items-start justify-between gap-3">
                      <span className="min-w-0 font-medium text-slate-900">{item.name}</span>
                      <span className="shrink-0 font-semibold tabular-nums text-slate-900 sm:hidden">{formatTaka(item.total)}</span>
                    </p>
                    <p className="text-xs tabular-nums text-slate-500 sm:hidden">
                      {item.quantity} × {formatTaka(item.unitPrice)}
                    </p>
                    <div className="mt-1.5 space-y-0.5 rounded-lg bg-amber-50 px-2.5 py-2 text-xs ring-1 ring-amber-100">
                      <p className="font-semibold text-amber-800">External product (not from our stock)</p>
                      <p className="text-slate-700">
                        Brought from: <span className="font-semibold text-slate-900">{item.supplierName || item.source || "Not recorded"}</span>
                        {item.supplierName && <span className="text-slate-500"> (supplier, due added)</span>}
                      </p>
                      <p className="text-slate-700">
                        Bought at: <span className="font-semibold text-slate-900">{formatTaka(item.unitCost)}</span> each · profit{" "}
                        <span className="font-semibold text-emerald-700">{formatTaka(item.total - item.cost)}</span>
                      </p>
                    </div>
                    {item.productCode && <p className="break-all font-mono text-xs text-slate-500">IMEI / ID: {item.productCode}</p>}
                  </td>
                  <td className="hidden px-3 py-2 text-right sm:table-cell">{item.quantity}</td>
                  <td className="hidden whitespace-nowrap px-3 py-2 text-right sm:table-cell">{formatTaka(item.unitPrice)}</td>
                  <td className="hidden whitespace-nowrap px-3 py-2 text-right font-semibold sm:table-cell">{formatTaka(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sale.tradeIns?.length > 0 && (
          <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-purple-700">Old devices taken in</p>
            <ul className="space-y-1 text-sm">
              {sale.tradeIns.map((line) => (
                <li key={line.product} className="flex justify-between gap-3">
                  <span>
                    {line.quantity} × {line.name}
                    {line.serials.length > 0 && <span className="ml-1 font-mono text-xs text-slate-500">({line.serials.join(", ")})</span>}
                  </span>
                  <span className="font-semibold text-purple-700">{formatTaka(line.total)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <dl className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-4">
          {sale.kind === "exchange" && (
            <>
              <Field label="Old device value">
                <span className="text-purple-700">{formatTaka(sale.exchangeValue)}</span>
              </Field>
              <Field label={sale.payable < 0 ? "We owed customer" : "Payable"}>{formatTaka(Math.abs(sale.payable))}</Field>
              {sale.payoutAmount > 0 && (
                <Field label="Paid out">
                  <span className="text-orange-600">{formatTaka(sale.payoutAmount)}</span>
                </Field>
              )}
            </>
          )}
          <Field label="Sub total">{formatTaka(sale.subTotal)}</Field>
          <Field label="Discount">{formatTaka(sale.discount)}</Field>
          <Field label="Delivery">{formatTaka(sale.deliveryCharge)}</Field>
          <Field label="Grand total">{formatTaka(sale.grandTotal)}</Field>
          <Field label="Paid">
            <span className="text-green-600">{formatTaka(sale.paidAmount)}</span>
          </Field>
          <Field label="Due">
            <span className={sale.dueAmount ? "text-red-600" : ""}>{formatTaka(sale.dueAmount)}</span>
          </Field>
          {canSeeProfit && (
            <>
              <Field label="Profit">
                <span className={sale.profit < 0 ? "text-red-600" : "text-green-600"}>{formatTaka(sale.profit)}</span>
              </Field>
              <Field label="Seller incentive">{formatTaka(sale.totalIncentive)}</Field>
            </>
          )}
        </dl>
      </div>
    )}
  </Modal>
);

export default SaleDetailsModal;
