import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import Input from "../../components/common/forms/Input";
import { ROUTES } from "../../constants/routes";
import { authService } from "../../services/authService";
import { isValid, validateConfirmPassword, validateEmail, validateNewPassword } from "../../utils/validators";

// Matches OTP_RESEND_COOLDOWN_SECONDS in the backend
const RESEND_COOLDOWN = 60;

const STEPS = { EMAIL: "email", OTP: "otp", RESET: "reset" };

const STEP_TEXT = {
  [STEPS.EMAIL]: ["Forgot password", "Enter your email and we'll send you a 6-digit code."],
  [STEPS.OTP]: ["Enter the code", "Check your email for the 6-digit code. It's valid for 10 minutes."],
  [STEPS.RESET]: ["Set a new password", "Choose a new password for your account."],
};

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
      await authService.forgotPassword({ email: email.trim() });
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
      const data = await authService.verifyOtp({ email: email.trim(), otp });
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
      await authService.resetPassword({ resetToken, newPassword: passwords.newPassword });
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

  return (
    <>
      <h2 className="mb-1 text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mb-5 text-sm text-slate-500">{subtitle}</p>

      <div className="mb-4 space-y-2">
        <Alert type="info">{info}</Alert>
        <Alert>{serverError}</Alert>
      </div>

      {step === STEPS.EMAIL && (
        <form onSubmit={handleEmailSubmit} noValidate className="space-y-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors({});
            }}
            error={errors.email}
          />
          <Button type="submit" loading={submitting} className="w-full">
            Send code
          </Button>
        </form>
      )}

      {step === STEPS.OTP && (
        <form onSubmit={handleOtpSubmit} noValidate className="space-y-4">
          <p className="text-sm text-slate-600">
            Code sent to <span className="font-medium text-slate-900">{email}</span>{" "}
            <button
              type="button"
              onClick={() => {
                setStep(STEPS.EMAIL);
                setOtp("");
                setServerError("");
                setInfo("");
              }}
              className="font-medium text-blue-600 hover:underline"
            >
              Change
            </button>
          </p>

          <Input
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
            className="[&_input]:tracking-[0.5em] [&_input]:text-center [&_input]:text-lg"
          />

          <Button type="submit" loading={submitting} className="w-full">
            Verify code
          </Button>

          <p className="text-center text-sm text-slate-500">
            Didn't get it?{" "}
            {cooldown > 0 ? (
              <span>Resend in {cooldown}s</span>
            ) : (
              <button type="button" onClick={sendOtp} disabled={submitting} className="font-medium text-blue-600 hover:underline">
                Resend code
              </button>
            )}
          </p>
        </form>
      )}

      {step === STEPS.RESET && (
        <form onSubmit={handleResetSubmit} noValidate className="space-y-4">
          <Input
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
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={passwords.confirmPassword}
            onChange={handlePasswordChange}
            error={errors.confirmPassword}
          />
          <Button type="submit" loading={submitting} className="w-full">
            Reset password
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm">
        <Link to={ROUTES.LOGIN} className="font-medium text-blue-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </>
  );
};

export default ForgotPassword;
