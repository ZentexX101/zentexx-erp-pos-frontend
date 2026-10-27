// Client-side checks mirroring the backend zod rules (src/modules/auth/auth.validation.js)
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 64;

export const validateEmail = (email) => {
  if (!email.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Invalid email address";
  return "";
};

export const validateNewPassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters`;
  if (password.length > PASSWORD_MAX) return `Password must be at most ${PASSWORD_MAX} characters`;
  return "";
};

export const validateConfirmPassword = (password, confirm) => {
  if (!confirm) return "Please confirm the password";
  if (password !== confirm) return "Passwords do not match";
  return "";
};

// Returns true when every value in the errors object is empty
export const isValid = (errors) => Object.values(errors).every((e) => !e);
