import ConfirmModal from "../common/modals/ConfirmModal";

// Asks before deleting; onConfirm errors show inside the modal
const ServiceDeleteModal = ({ service, onClose, onConfirm }) => (
  <ConfirmModal
    isOpen={Boolean(service)}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Delete service"
    confirmLabel="Delete"
    danger
    message={
      <>
        Delete <span className="font-medium text-slate-900">{service?.name}</span>? This can't be undone. If you only want to stop
        using it, set it to inactive instead.
      </>
    }
  />
);

export default ServiceDeleteModal;
