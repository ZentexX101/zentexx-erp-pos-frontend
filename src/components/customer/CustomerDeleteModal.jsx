import ConfirmModal from "../common/modals/ConfirmModal";

// Asks before deleting; onConfirm errors (e.g. balance not settled) show inside the modal
const CustomerDeleteModal = ({ customer, onClose, onConfirm }) => (
  <ConfirmModal
    isOpen={Boolean(customer)}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Delete customer"
    confirmLabel="Delete"
    danger
    message={
      <>
        Delete <span className="font-medium text-slate-900">{customer?.name}</span>? This can't be undone. A customer with an
        unsettled balance can't be deleted; set it to inactive instead.
      </>
    }
  />
);

export default CustomerDeleteModal;
