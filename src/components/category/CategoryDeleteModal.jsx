import ConfirmModal from "../common/modals/ConfirmModal";

// Asks before deleting; onConfirm errors show inside the modal
const CategoryDeleteModal = ({ category, onClose, onConfirm }) => (
  <ConfirmModal
    isOpen={Boolean(category)}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Delete category"
    confirmLabel="Delete"
    danger
    message={
      <>
        Delete <span className="font-medium text-slate-900">{category?.name}</span>? This can't be undone. If you only want to
        stop using it, set it to inactive instead.
      </>
    }
  />
);

export default CategoryDeleteModal;
