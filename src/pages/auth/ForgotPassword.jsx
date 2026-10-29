import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import Input from "../../components/common/forms/Input";
import Icon from "../../components/common/icons/Icon";
import { ROUTES } from "../../constants/routes";
import { forgotPassword, resetPassword, verifyOtp } from "../../providers/apiProviders/authApiProvider";
import { isValid, validateConfirmPassword, validateEmail, validateNewPassword } from "../../utils/validators";

// Matches OTP_RESEND_COOLDOWN_SECONDS in the backend
const RESEND_COOLDOWN = 60;

const STEPS = { EMAIL: "email", OTP: "otp", RESET: "reset" };

const STEP_TEXT = {
  [STEPS.EMAIL]: ["Reset your password", "Enter the email on your account and we'll send you a 6-digit code."],
  [STEPS.OTP]: ["Check your email", "Enter the 6-digit code we sent. It's valid for 10 minutes."],
  [STEPS.RESET]: ["Choose a new password", "Use at least 8 characters. Avoid one you've used before."],
};
const STEP_ORDER = [STEPS.EMAIL, STEPS.OTP, STEPS.RESET];

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Wraps each step's request with loading + error handling
  const run = async (action) => {
    setServerError("");
    setInfo("");
    setSubmitting(true);
    try {
      await action();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const sendOtp = () =>
    run(async () => {
      await forgotPassword({ email: email.trim() });
      setStep(STEPS.OTP);
      setCooldown(RESEND_COOLDOWN);
      setInfo("If an account exists for this email, a code has been sent.");
    });

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    const newErrors = { email: validateEmail(email) };
    setErrors(newErrors);
    if (isValid(newErrors)) sendOtp();
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const newErrors = { otp: /^\d{6}$/.test(otp) ? "" : "Enter the 6-digit code" };
    setErrors(newErrors);
    if (!isValid(newErrors)) return;

    run(async () => {
      const data = await verifyOtp({ email: email.trim(), otp });
      setResetToken(data.resetToken);
      setStep(STEPS.RESET);
    });
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    const newErrors = {
      newPassword: validateNewPassword(passwords.newPassword),
      confirmPassword: validateConfirmPassword(passwords.newPassword, passwords.confirmPassword),
    };
    setErrors(newErrors);
    if (!isValid(newErrors)) return;

    run(async () => {
      await resetPassword({ resetToken, newPassword: passwords.newPassword });
      navigate(ROUTES.LOGIN, {
        replace: true,
        state: { notice: "Password reset successfully. Please sign in with your new password." },
      });
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const [title, subtitle] = STEP_TEXT[step];
  const stepIndex = STEP_ORDER.indexOf(step);

  return (
    <div>
      <Link
        to={ROUTES.LOGIN}
        className="-ml-1 mb-8 inline-flex items-center gap-1.5 rounded-md p-1 text-sm text-neutral-500 hover:text-neutral-900"
      >
        <Icon name="arrowLeft" />
        Sign in
      </Link>

      <p className="mb-2 text-xs text-neutral-400">
        Step {stepIndex + 1} of {STEP_ORDER.length}
      </p>
      <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-neutral-900">{title}</h1>
      <p className="mt-2 mb-9 text-[15px] text-neutral-500">{subtitle}</p>

      {(info || serverError) && (
        <div className="mb-5 space-y-2">
          <Alert type="info">{info}</Alert>
          <Alert>{serverError}</Alert>
        </div>
      )}

      {step === STEPS.EMAIL && (
        <form onSubmit={handleEmailSubmit} noValidate className="space-y-5">
          <Input
            variant="soft"
            label="Email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors({});
            }}
            error={errors.email}
          />
          <Button type="submit" variant="dark" loading={submitting} className="h-12 w-full lg:h-11">
            Send code
          </Button>
        </form>
      )}

      {step === STEPS.OTP && (
        <form onSubmit={handleOtpSubmit} noValidate className="space-y-5">
          <p className="text-sm text-neutral-600">
            Sent to <span className="font-medium text-neutral-900">{email}</span> ·{" "}
            <button
              type="button"
              onClick={() => {
                setStep(STEPS.EMAIL);
                setOtp("");
                setServerError("");
                setInfo("");
              }}
              className="text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900"
            >
              Change
            </button>
          </p>

          <Input
            variant="soft"
            label="6-digit code"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            maxLength={6}
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, ""));
              setErrors({});
            }}
            error={errors.otp}
            placeholder="••••••"
            inputClassName="text-center font-mono text-2xl tracking-[0.6em]"
          />

          <Button type="submit" variant="dark" loading={submitting} className="h-12 w-full lg:h-11">
            Verify code
          </Button>

          <p className="text-sm text-neutral-500">
            Didn't get it?{" "}
            {cooldown > 0 ? (
              <span>Resend in {cooldown}s</span>
            ) : (
              <button type="button" onClick={sendOtp} disabled={submitting} className="text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900">
                Resend code
              </button>
            )}
          </p>
        </form>
      )}

      {step === STEPS.RESET && (
        <form onSubmit={handleResetSubmit} noValidate className="space-y-5">
          <Input
            variant="soft"
            label="New password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            autoFocus
            value={passwords.newPassword}
            onChange={handlePasswordChange}
            error={errors.newPassword}
          />
          <Input
            variant="soft"
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={passwords.confirmPassword}
            onChange={handlePasswordChange}
            error={errors.confirmPassword}
          />
          <Button type="submit" variant="dark" loading={submitting} className="h-12 w-full lg:h-11">
            Reset password
          </Button>
        </form>
      )}

    </div>
  );
};

export default ForgotPassword;
