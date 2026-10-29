import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { formatPhone } from "../../utils/phone";
import Modal from "../common/modals/Modal";

const Field = ({ label, children }) => (
  <div>
    <dt className="text-xs text-slate-500">{label}</dt>
    <dd className="font-medium text-slate-900">{children}</dd>
  </div>
);

// One payment row: who paid / was paid, through which methods, and the note. party: "supplier" | "customer"
const PaymentDetailsModal = ({ payment, party, onClose }) => (
  <Modal isOpen={Boolean(payment)} onClose={onClose} title={`Payment ${payment?.paymentNo ?? ""}`} subtitle={payment && formatDateTime(payment.date)} size="lg">
    {payment && (
      <div className="space-y-5">
        <dl className="grid gap-4 sm:grid-cols-3">
          <Field label={party === "supplier" ? "Supplier" : "Customer"}>
            {payment[party]?.name}
            <span className="block text-xs font-normal text-slate-500">{formatPhone(payment[party]?.phone)}</span>
          </Field>
          <Field label="Branch">{payment.branch?.name ?? "—"}</Field>
          <Field label="Created by">{payment.createdBy?.name ?? "—"}</Field>
        </dl>

        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2 font-semibold">Payment Method</th>
                <th className="px-3 py-2 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payment.payments.map((line) => (
                <tr key={line.paymentMethod?._id}>
                  <td className="px-3 py-2">{line.paymentMethod?.name}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right">{formatTaka(line.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-slate-200 bg-slate-50 font-semibold">
              <tr>
                <td className="px-3 py-2">Total</td>
                <td className="whitespace-nowrap px-3 py-2 text-right">{formatTaka(payment.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {payment.note && (
          <div>
            <p className="text-xs text-slate-500">Note</p>
            <p className="whitespace-pre-line text-sm text-slate-700">{payment.note}</p>
          </div>
        )}
      </div>
    )}
  </Modal>
);

export default PaymentDetailsModal;
