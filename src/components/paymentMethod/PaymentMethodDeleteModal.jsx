import ConfirmModal from "../common/modals/ConfirmModal";

// Asks before deleting; onConfirm errors (money left, has transactions) show inside the modal
const PaymentMethodDeleteModal = ({ paymentMethod, onClose, onConfirm }) => (
  <ConfirmModal
    isOpen={Boolean(paymentMethod)}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Delete payment method"
    confirmLabel="Delete"
    danger
    message={
      <>
        Delete <span className="font-medium text-slate-900">{paymentMethod?.name}</span>? This can't be undone. A method that still
        has money or any transaction can't be deleted; set it to inactive instead.
      </>
    }
  />
);

export default PaymentMethodDeleteModal;
