import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { formatPhone } from "../../utils/phone";
import Modal from "../common/modals/Modal";
import InvoiceItemsTable from "../purchase/InvoiceItemsTable";

const Field = ({ label, children }) => (
  <div>
    <dt className="text-xs text-slate-500">{label}</dt>
    <dd className="font-medium text-slate-900">{children}</dd>
  </div>
);

// One POS return: what came back (with IMEIs), the refund and what was adjusted on the balance
const SaleReturnDetailsModal = ({ saleReturn, onClose }) => (
  <Modal
    isOpen={Boolean(saleReturn)}
    onClose={onClose}
    title={`Return ${saleReturn?.returnNo ?? ""}`}
    subtitle={saleReturn && `Order ${saleReturn.invoiceNo} · ${formatDateTime(saleReturn.date)}`}
    size="xl"
  >
    {saleReturn && (
      <div className="space-y-5">
        <dl className="grid gap-4 sm:grid-cols-3">
          <Field label="Customer">
            {saleReturn.customer?.name ?? "Walk-in customer"}
            {saleReturn.customer && <span className="block text-xs font-normal text-slate-500">{formatPhone(saleReturn.customer.phone)}</span>}
          </Field>
          <Field label="Refunded through">
            {saleReturn.refunds.map((line) => `${line.paymentMethod?.name} ${formatTaka(line.amount)}`).join(", ") || "—"}
          </Field>
          <Field label="Created by">{saleReturn.createdBy?.name ?? "—"}</Field>
        </dl>

        <InvoiceItemsTable items={saleReturn.items.map((item) => ({ ...item, unitCost: item.unitPrice }))} total={saleReturn.totalAmount} />

        <dl className="grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3">
          <Field label="Return total">{formatTaka(saleReturn.totalAmount)}</Field>
          <Field label="Refunded">
            <span className="text-orange-600">{formatTaka(saleReturn.refundAmount)}</span>
          </Field>
          <Field label="Adjusted on balance">{formatTaka(saleReturn.adjustedAmount)}</Field>
        </dl>

        {saleReturn.note && (
          <div>
            <p className="text-xs text-slate-500">Note</p>
            <p className="whitespace-pre-line text-sm text-slate-700">{saleReturn.note}</p>
          </div>
        )}
      </div>
    )}
  </Modal>
);

export default SaleReturnDetailsModal;
