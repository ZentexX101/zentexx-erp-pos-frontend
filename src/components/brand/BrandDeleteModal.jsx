import ConfirmModal from "../common/modals/ConfirmModal";

// Asks before deleting; onConfirm errors show inside the modal
const BrandDeleteModal = ({ brand, onClose, onConfirm }) => (
  <ConfirmModal
    isOpen={Boolean(brand)}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Delete brand"
    confirmLabel="Delete"
    danger
    message={
      <>
        Delete <span className="font-medium text-slate-900">{brand?.name}</span>? This can't be undone. If you only want to stop
        using it, set it to inactive instead.
      </>
    }
  />
);

export default BrandDeleteModal;
