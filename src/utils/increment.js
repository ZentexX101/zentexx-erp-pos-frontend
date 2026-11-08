import { formatTaka } from "./money";
import { roundTaka } from "./number";

// "+৳5,000.00 (+25%)" / "−৳2,000.00 (−10%)"
export const changeText = (difference, percent) => {
  const sign = difference > 0 ? "+" : difference < 0 ? "−" : "";
  const pct = percent === null || percent === undefined ? "" : ` (${sign}${Math.abs(percent)}%)`;
  return `${sign}${formatTaka(Math.abs(difference))}${pct}`;
};

export const percentOf = (oldSalary, newSalary) => (oldSalary > 0 ? Math.round(((newSalary - oldSalary) / oldSalary) * 1000) / 10 : null);

// The quick raises on the Change salary form
export const QUICK_RAISES = [
  { label: "+5%", apply: (base) => roundTaka(base * 1.05) },
  { label: "+10%", apply: (base) => roundTaka(base * 1.1) },
  { label: "+15%", apply: (base) => roundTaka(base * 1.15) },
  { label: "+20%", apply: (base) => roundTaka(base * 1.2) },
  { label: "+৳1,000", apply: (base) => roundTaka(base + 1000) },
  { label: "+৳2,000", apply: (base) => roundTaka(base + 2000) },
  { label: "+৳5,000", apply: (base) => roundTaka(base + 5000) },
];

export const REASONS = ["Yearly increment", "Promotion", "Good performance", "New responsibility", "Salary correction", "Decrease"];

// Tone for a change: green for a raise, red for a cut
export const changeTone = (difference) => (difference > 0 ? "text-emerald-600" : difference < 0 ? "text-red-600" : "text-slate-500");
