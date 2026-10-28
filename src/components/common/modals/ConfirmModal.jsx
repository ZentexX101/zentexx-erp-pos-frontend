import { useState } from "react";
import Alert from "../alerts/Alert";
import Button from "../buttons/Button";
import Modal from "./Modal";

// Asks before an action. onConfirm may be async; a thrown error is shown inside and the modal stays open.
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Confirm", danger = false }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const close = () => {
    setError("");
    onClose();
  };

  const handleConfirm = async () => {
    setBusy(true);
    setError("");
    try {
      await onConfirm();
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title={title}
      placement="center"
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={busy}>
            Cancel
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={handleConfirm} loading={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="text-sm text-slate-600">{message}</div>
        <Alert>{error}</Alert>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
