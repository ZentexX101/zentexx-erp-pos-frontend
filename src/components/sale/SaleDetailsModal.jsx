import { LuPrinter } from "react-icons/lu";
import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { formatPhone } from "../../utils/phone";
import Button from "../common/buttons/Button";
import Modal from "../common/modals/Modal";

const Field = ({ label, children }) => (
  <div>
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
        <dl className="grid gap-4 sm:grid-cols-3">
          <Field label="Customer">
            {sale.customer?.name ?? "Walk-in customer"}
            {sale.customer && <span className="block text-xs font-normal text-slate-500">{formatPhone(sale.customer.phone)}</span>}
          </Field>
          <Field label="Sold by">{sale.soldBy?.name ?? "—"}</Field>
          <Field label="Paid with">{sale.payments.map((line) => `${line.paymentMethod?.name} ${formatTaka(line.amount)}`).join(", ") || "—"}</Field>
        </dl>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2 font-semibold">Product</th>
                <th className="px-3 py-2 text-right font-semibold">Qty</th>
                <th className="px-3 py-2 text-right font-semibold">Price</th>
                <th className="px-3 py-2 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sale.items.map((item) => (
                <tr key={item.product} className="align-top">
                  <td className="px-3 py-2">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    {item.serials.length > 0 && <p className="break-all font-mono text-xs text-slate-500">{item.serials.join(", ")}</p>}
                    {item.returnedQuantity > 0 && (
                      <p className="text-xs font-semibold text-orange-600">
                        Returned: {item.returnedQuantity}
                        {item.returnedSerials.length > 0 && ` (${item.returnedSerials.join(", ")})`}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">{item.quantity}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right">{formatTaka(item.unitPrice)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right font-semibold">{formatTaka(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-4">
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
