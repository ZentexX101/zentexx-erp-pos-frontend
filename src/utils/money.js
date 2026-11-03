// 5000 -> "৳5,000.00" (Indian digit grouping, always 2 decimals); pass { sign: false } to drop the minus
export const formatTaka = (amount, { sign = true } = {}) => {
  const value = sign ? Number(amount) || 0 : Math.abs(Number(amount) || 0);
  const formatted = Math.abs(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${value < 0 ? "-" : ""}৳${formatted}`;
};

// Short taka for chart axes and tight spots, in the Bangladeshi way: ৳950, ৳45K, ৳1.5L, ৳2.3Cr
export const formatTakaShort = (amount) => {
  const value = Math.abs(Number(amount) || 0);
  const sign = Number(amount) < 0 ? "-" : "";
  // 2 decimals under 10 (1,96,970 -> ৳1.97L, never ৳2L), 1 under 100, none above
  const short = (n, unit) => `${sign}৳${Number(n.toFixed(n < 10 ? 2 : n < 100 ? 1 : 0))}${unit}`;
  if (value >= 10000000) return short(value / 10000000, "Cr");
  if (value >= 100000) return short(value / 100000, "L");
  if (value >= 1000) return short(value / 1000, "K");
  return `${sign}৳${Math.round(value)}`;
};

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

// 0-99 -> "Eighty-Two"
const twoDigits = (n) => (n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? `-${ONES[n % 10]}` : ""}`);

// Whole number in the Bangladeshi system (crore, lakh, thousand, hundred): 104500 -> "One Lakh Four Thousand Five Hundred"
const wholeInWords = (n) => {
  const parts = [];
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const hundred = Math.floor((n % 1000) / 100);
  const rest = n % 100;
  if (crore) parts.push(`${wholeInWords(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (hundred) parts.push(`${ONES[hundred]} Hundred`);
  if (rest) parts.push(twoDigits(rest));
  return parts.join(" ");
};

// Taka in words: 500 -> "Five Hundred Taka", 82380.5 -> "Eighty-Two Thousand Three Hundred Eighty Taka and Fifty Paisa",
// -78420 -> "Minus Seventy-Eight Thousand Four Hundred Twenty Taka"
export const takaInWords = (amount) => {
  const value = Math.round(Math.abs(Number(amount) || 0) * 100);
  const taka = Math.floor(value / 100);
  const paisa = value % 100;
  const words = `${taka ? wholeInWords(taka) : "Zero"} Taka${paisa ? ` and ${twoDigits(paisa)} Paisa` : ""}`;
  return Number(amount) < 0 && value ? `Minus ${words}` : words;
};
