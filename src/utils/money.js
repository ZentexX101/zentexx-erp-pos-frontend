// 5000 -> "৳5,000.00" (Indian digit grouping, always 2 decimals); pass { sign: false } to drop the minus
export const formatTaka = (amount, { sign = true } = {}) => {
  const value = sign ? Number(amount) || 0 : Math.abs(Number(amount) || 0);
  const formatted = Math.abs(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${value < 0 ? "-" : ""}৳${formatted}`;
};
