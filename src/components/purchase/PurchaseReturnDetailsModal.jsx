import { formatDateTime } from "../../utils/formatDate";
import { formatPhone } from "../../utils/phone";
import Modal from "../common/modals/Modal";
import InvoiceItemsTable from "./InvoiceItemsTable";

// One purchase return: supplier and the items (with IMEIs) sent back
const PurchaseReturnDetailsModal = ({ purchaseReturn, onClose }) => (
  <Modal
    isOpen={Boolean(purchaseReturn)}
    onClose={onClose}
    title={`Return ${purchaseReturn?.returnNo ?? ""}`}
    subtitle={purchaseReturn && formatDateTime(purchaseReturn.date)}
    size="xl"
  >
    {purchaseReturn && (
      <div className="space-y-5">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">Supplier</dt>
            <dd className="font-medium text-slate-900">
              {purchaseReturn.supplier?.name}
              <span className="block text-xs font-normal text-slate-500">{formatPhone(purchaseReturn.supplier?.phone)}</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Created by</dt>
            <dd className="font-medium text-slate-900">{purchaseReturn.createdBy?.name ?? "—"}</dd>
          </div>
        </dl>

        <InvoiceItemsTable items={purchaseReturn.items} total={purchaseReturn.totalAmount} />

        {purchaseReturn.note && (
          <div>
            <p className="text-xs text-slate-500">Note</p>
            <p className="whitespace-pre-line text-sm text-slate-700">{purchaseReturn.note}</p>
          </div>
        )}
      </div>
    )}
  </Modal>
);

export default PurchaseReturnDetailsModal;
