import ConfirmModal from "../common/modals/ConfirmModal";

// Asks before deleting; onConfirm errors (e.g. balance not settled) show inside the modal
const SupplierDeleteModal = ({ supplier, onClose, onConfirm }) => (
  <ConfirmModal
    isOpen={Boolean(supplier)}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Delete supplier"
    confirmLabel="Delete"
    danger
    message={
      <>
        Delete <span className="font-medium text-slate-900">{supplier?.name}</span>? This can't be undone. A supplier with an
        unsettled balance can't be deleted; set it to inactive instead.
      </>
    }
  />
);

export default SupplierDeleteModal;
