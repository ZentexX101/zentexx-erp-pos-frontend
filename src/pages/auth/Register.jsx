import { useState } from "react";
import { Link } from "react-router";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import Input from "../../components/common/forms/Input";
import { ROUTES } from "../../constants/routes";
import { authService } from "../../services/authService";
import { isValid, validateConfirmPassword, validateEmail, validateNewPassword } from "../../utils/validators";

const EMPTY_FORM = { name: "", email: "", phone: "", password: "", confirmPassword: "" };

const Register = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const newErrors = {
      name: form.name.trim().length >= 2 ? "" : "Name must be at least 2 characters",
      email: validateEmail(form.email),
      phone: form.phone.trim().length > 20 ? "Phone number is too long" : "",
      password: validateNewPassword(form.password),
      confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
    };
    setErrors(newErrors);
    if (!isValid(newErrors)) return;

    setSubmitting(true);
    try {
      const user = await authService.register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
      });
      setSubmittedEmail(user.email);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedEmail) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Waiting for approval</h2>
        <p className="mb-6 text-sm text-slate-500">
          Your account <span className="font-medium text-slate-900">{submittedEmail}</span> has been created. You can sign in
          once an admin approves it.
        </p>
        <Link to={ROUTES.LOGIN} className="font-medium text-blue-600 hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="mb-1 text-lg font-semibold text-slate-900">Create an account</h2>
      <p className="mb-5 text-sm text-slate-500">An admin will review your request before you can sign in.</p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Alert>{serverError}</Alert>

        <Input
          label="Full name"
          name="name"
          autoComplete="name"
          autoFocus
          value={form.name}
          onChange={handleChange}
          error={errors.name}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />
        <Input
          label="Phone (optional)"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={handleChange}
          error={errors.phone}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />
        <Input
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <Button type="submit" loading={submitting} className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to={ROUTES.LOGIN} className="font-medium text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
};

export default Register;
