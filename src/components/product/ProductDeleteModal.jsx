import ConfirmModal from "../common/modals/ConfirmModal";

// Asks before deleting; onConfirm errors show inside the modal
const ProductDeleteModal = ({ product, onClose, onConfirm }) => (
  <ConfirmModal
    isOpen={Boolean(product)}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Delete product"
    confirmLabel="Delete"
    danger
    message={
      <>
        Delete <span className="font-medium text-slate-900">{product?.name}</span>? Its image is deleted too and this can't be
        undone. If you only want to stop selling it, set it to inactive instead.
      </>
    }
  />
);

export default ProductDeleteModal;
