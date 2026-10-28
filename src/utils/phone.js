// Phone helpers for PhoneInput (+880 prefix). The backend normalizes too
// (src/helper/utils/phone.js); these only shape what the form shows and sends.

// "1712345678" or "01712345678" → "+8801712345678"
export const toE164 = (local) => {
  const digits = String(local || "").replace(/\D/g, "").replace(/^0/, "");
  return digits ? `+880${digits}` : "";
};

// "+8801712345678" → "1712345678" for editing in PhoneInput
export const fromE164 = (phone) => (phone || "").replace(/^\+880/, "");

// "+8801712345678" → "01712-345678" for tables
export const formatPhone = (phone) => {
  const match = /^\+880(1\d{3})(\d{6})$/.exec(phone || "");
  return match ? `0${match[1]}-${match[2]}` : phone || "—";
};

export const validateBdMobile = (local) => {
  if (!local) return "Phone is required";
  return /^0?1[3-9]\d{8}$/.test(local) ? "" : "Enter a valid mobile number, e.g. 1712 345678";
};
