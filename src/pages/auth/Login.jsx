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
      <h2 className="mb-1 text-lg font-semibold text-slate-900">Sign in</h2>
      <p className="mb-5 text-sm text-slate-500">Enter your account details to continue.</p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {notice && <Alert type="success">{notice}</Alert>}
        <Alert>{serverError}</Alert>

        <Input
          label="Phone or Email"
          name="identifier"
          autoComplete="username"
          autoFocus
          placeholder="01712345678 or you@example.com"
          value={form.identifier}
          onChange={handleChange}
          error={errors.identifier}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <input
              type="checkbox"
              name="rememberMe"
              checked={form.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 accent-blue-600"
            />
            Remember me
          </label>
          <Link to={ROUTES.FORGOT_PASSWORD} className="font-medium text-blue-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" loading={submitting} className="w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <Link to={ROUTES.REGISTER} className="font-medium text-blue-600 hover:underline">
          Create one
        </Link>
      </p>
    </>
  );
};

export default Login;
