import { useState } from "react";
import { staffService } from "../../services/staffService";
import { isValid, validateConfirmPassword, validateNewPassword } from "../../utils/validators";
import Alert from "../common/alerts/Alert";
import Button from "../common/buttons/Button";
import Input from "../common/forms/Input";
import Modal from "../common/modals/Modal";

// Admin sets a new password for a staff member (e.g. they forgot it)
const ResetPasswordModal = ({ staff, onClose, onDone }) => {
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const newErrors = {
      password: validateNewPassword(form.password),
      confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
    };
    setErrors(newErrors);
    if (!isValid(newErrors)) return;

    setSubmitting(true);
    try {
      await staffService.resetPassword(staff._id, form.password);
      onDone(staff);
    } catch (err) {
      setServerError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Reset password" footer={false}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <p className="text-sm text-slate-600">
          Set a new password for <span className="font-medium text-slate-900">{staff.name}</span> ({staff.email}). They'll
          be logged out of all devices and must sign in with the new password.
        </p>
        <Alert>{serverError}</Alert>
        <Input
          label="New password"
          name="password"
          type="password"
          autoFocus
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />
        <Input
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Reset password
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ResetPasswordModal;
