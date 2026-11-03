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
