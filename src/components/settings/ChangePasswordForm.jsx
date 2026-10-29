import { useState } from "react";
import { LuCheck } from "react-icons/lu";
import { changePassword } from "../../providers/apiProviders/authApiProvider";
import { isValid, PASSWORD_MIN, validateConfirmPassword, validateNewPassword } from "../../utils/validators";
import Alert from "../common/alerts/Alert";
import Button from "../common/buttons/Button";
import Input from "../common/forms/Input";
import SettingsCard from "./SettingsCard";

const FORM_ID = "change-password-form";
const EMPTY_FORM = { currentPassword: "", newPassword: "", confirmPassword: "" };

// One line of the live password checklist
const Rule = ({ met, children }) => (
  <li className={`flex items-center gap-2 text-sm ${met ? "text-emerald-700" : "text-slate-500"}`}>
    <span
      className={`flex size-4 items-center justify-center rounded-full ${met ? "bg-emerald-600 text-white" : "border border-slate-300"}`}
      aria-hidden="true"
    >
      {met && <LuCheck className="size-3" strokeWidth={3} />}
    </span>
    {children}
  </li>
);

const ChangePasswordForm = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSuccess("");
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

  const { currentPassword, newPassword, confirmPassword } = form;

  return (
    <SettingsCard
      title="Password"
      description="Changing it signs you out on every other device."
      footer={
        <Button type="submit" form={FORM_ID} loading={submitting}>
          Update password
        </Button>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="max-w-md space-y-4">
        <Alert type="success">{success}</Alert>
        <Alert>{serverError}</Alert>

        <Input
          label="Current password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={handleChange}
          error={errors.currentPassword}
        />
        <Input
          label="New password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={handleChange}
          error={errors.newPassword}
        />
        <Input
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <ul className="space-y-1.5 pt-1">
          <Rule met={newPassword.length >= PASSWORD_MIN}>At least {PASSWORD_MIN} characters</Rule>
          <Rule met={Boolean(newPassword) && newPassword !== currentPassword}>Different from your current password</Rule>
          <Rule met={Boolean(confirmPassword) && newPassword === confirmPassword}>Both new passwords match</Rule>
        </ul>
      </form>
    </SettingsCard>
  );
};

export default ChangePasswordForm;
