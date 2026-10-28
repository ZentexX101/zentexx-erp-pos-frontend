import { useState } from "react";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import Input from "../../components/common/forms/Input";
import { changePassword } from "../../providers/apiProviders/authApiProvider";
import { isValid, validateConfirmPassword, validateNewPassword } from "../../utils/validators";

const EMPTY_FORM = { currentPassword: "", newPassword: "", confirmPassword: "" };

const ChangePassword = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccess("");

    const newErrors = {
      currentPassword: form.currentPassword ? "" : "Current password is required",
      newPassword:
        validateNewPassword(form.newPassword) ||
        (form.newPassword === form.currentPassword ? "New password must be different from the current password" : ""),
      confirmPassword: validateConfirmPassword(form.newPassword, form.confirmPassword),
    };
    setErrors(newErrors);
    if (!isValid(newErrors)) return;

    setSubmitting(true);
    try {
      const res = await changePassword(form);
      setSuccess(res.message);
      setForm(EMPTY_FORM);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-slate-900">Change password</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        After changing your password, all your other devices will be logged out.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <Alert type="success">{success}</Alert>
        <Alert>{serverError}</Alert>

        <Input
          label="Current password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          value={form.currentPassword}
          onChange={handleChange}
          error={errors.currentPassword}
        />
        <Input
          label="New password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          value={form.newPassword}
          onChange={handleChange}
          error={errors.newPassword}
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

        <Button type="submit" loading={submitting}>
          Update password
        </Button>
      </form>
    </div>
  );
};

export default ChangePassword;
