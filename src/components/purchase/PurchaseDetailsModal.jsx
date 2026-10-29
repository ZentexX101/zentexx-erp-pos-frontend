import { formatDateTime } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { formatPhone } from "../../utils/phone";
import Modal from "../common/modals/Modal";
import InvoiceItemsTable from "./InvoiceItemsTable";

const Field = ({ label, children }) => (
  <div>
    <dt className="text-xs text-slate-500">{label}</dt>
    <dd className="font-medium text-slate-900">{children}</dd>
  </div>
);

// One purchase invoice: supplier, items with IMEIs, and what was paid
const PurchaseDetailsModal = ({ purchase, onClose }) => (
  <Modal isOpen={Boolean(purchase)} onClose={onClose} title={`Purchase ${purchase?.invoiceNo ?? ""}`} subtitle={purchase && formatDateTime(purchase.date)} size="xl">
    {purchase && (
      <div className="space-y-5">
        <dl className="grid gap-4 sm:grid-cols-3">
          <Field label="Supplier">
            {purchase.supplier?.name}
            <span className="block text-xs font-normal text-slate-500">{formatPhone(purchase.supplier?.phone)}</span>
          </Field>
          <Field label="Paid from">{purchase.paymentMethod?.name ?? "—"}</Field>
          <Field label="Created by">{purchase.createdBy?.name ?? "—"}</Field>
        </dl>

        <InvoiceItemsTable items={purchase.items} total={purchase.totalAmount} showSalePrice />

        <dl className="grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3">
          <Field label="Total">{formatTaka(purchase.totalAmount)}</Field>
          <Field label="Paid">
            <span className="text-green-600">{formatTaka(purchase.paidAmount)}</span>
          </Field>
          <Field label="Due">
            <span className={purchase.dueAmount ? "text-red-600" : ""}>{formatTaka(purchase.dueAmount)}</span>
          </Field>
        </dl>

        {purchase.note && (
          <div>
            <p className="text-xs text-slate-500">Note</p>
            <p className="whitespace-pre-line text-sm text-slate-700">{purchase.note}</p>
          </div>
        )}
      </div>
    )}
  </Modal>
);

export default PurchaseDetailsModal;
