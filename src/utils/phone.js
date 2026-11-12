import { isValidPhoneNumber, parsePhoneNumberFromString } from "libphonenumber-js/max";

// Phone helpers for PhoneInput. Numbers travel and are stored in E.164 ("+8801712345678", "+966501234567");
// the backend normalizes and validates too (src/helper/utils/phone.js).

export const DEFAULT_COUNTRY = "BD";

// PhoneInput already gives E.164; this only trims what it sends ("" when empty)
export const toE164 = (value) => String(value || "").trim();

// A stored number for PhoneInput to edit
export const fromE164 = (phone) => phone || "";

// The country and the number within it, for PhoneInput ({ country: "SA", national: "501234567" })
export const splitPhone = (phone) => {
  const parsed = parsePhoneNumberFromString(phone || "");
  return parsed?.country ? { country: parsed.country, national: parsed.nationalNumber } : { country: DEFAULT_COUNTRY, national: "" };
};

// Bangladesh as "01712-345678" (how it's dialled here); other countries "+966 50 123 4567"
export const formatPhone = (phone) => {
  const parsed = parsePhoneNumberFromString(phone || "");
  if (!parsed) return phone || "—";
  return parsed.country === DEFAULT_COUNTRY ? parsed.formatNational() : parsed.formatInternational();
};

export const validatePhone = (phone) => {
  if (!phone) return "Phone is required";
  return isValidPhoneNumber(phone) ? "" : "Enter a valid phone number for the selected country";
};
