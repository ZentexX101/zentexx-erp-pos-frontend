import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import Input from "../../components/common/forms/Input";
import { getHomePath, ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { isValid } from "../../utils/validators";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ identifier: "", password: "", rememberMe: false });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // e.g. "Password reset successfully" after the forgot-password flow
  const notice = location.state?.notice;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const newErrors = {
      identifier: form.identifier.trim() ? "" : "Enter your phone number or email",
      password: form.password ? "" : "Password is required",
    };
    setErrors(newErrors);
    if (!isValid(newErrors)) return;

    setSubmitting(true);
    try {
      const user = await login({ identifier: form.identifier.trim(), password: form.password, rememberMe: form.rememberMe });
      navigate(location.state?.from?.pathname || getHomePath(user), { replace: true });
    } catch (err) {
      setServerError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-neutral-900">Sign in</h1>
      <p className="mt-2 mb-9 text-[15px] text-neutral-500">Use the phone number or email your admin set up for you.</p>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {notice && <Alert type="success">{notice}</Alert>}
        <Alert>{serverError}</Alert>

        <Input
          variant="soft"
          label="Phone or Email"
          name="identifier"
          autoComplete="username"
          autoFocus
          placeholder="01XXXXXXXXX"
          value={form.identifier}
          onChange={handleChange}
          error={errors.identifier}
        />

        <Input
          variant="soft"
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          labelAside={
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="text-[13px] text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline"
            >
              Forgot password?
            </Link>
          }
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />

        <label className="flex w-fit cursor-pointer select-none items-center gap-2.5 text-sm text-neutral-600">
          <input
            type="checkbox"
            name="rememberMe"
            checked={form.rememberMe}
            onChange={handleChange}
            className="h-4 w-4 cursor-pointer accent-neutral-900"
          />
          Keep me signed in on this device
        </label>

        <div className="pt-2">
          <Button type="submit" variant="dark" loading={submitting} className="h-12 w-full lg:h-11">
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </div>
      </form>

      <p className="mt-10 border-t border-neutral-100 pt-6 text-sm text-neutral-500">
        No account yet? Ask your branch manager to set one up for you.
      </p>
    </>
  );
};

export default Login;
