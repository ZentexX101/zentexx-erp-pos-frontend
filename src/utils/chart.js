const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Trend bucket label -> axis text: "2026-11-03" -> "3 Nov", "2026-11" -> "Nov 26"
export const bucketLabel = (label) => {
  if (!label) return "";
  const [year, month, day] = label.split("-");
  return day ? `${Number(day)} ${MONTHS[Number(month) - 1]}` : `${MONTHS[Number(month) - 1]} ${year.slice(2)}`;
};

// Share of a total as a whole percent (0 when there's no total)
export const percentOf = (part, total) => (total > 0 ? Math.round((part / total) * 100) : 0);
