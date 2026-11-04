import { formatShortDate } from "./formatDate";

// Quick periods for list filters ("Today" like the reference app); custom uses its own dates
export const PERIOD_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last_7_days", label: "Last 7 days" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "all", label: "All time" },
  { value: "custom", label: "Custom range" },
];

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// period -> { from, to } as YYYY-MM-DD ("" = no limit). custom = { from, to } the user picked.
export const periodRange = (period, custom = {}) => {
  const now = new Date();
  switch (period) {
    case "today":
      return { from: formatShortDate(now), to: formatShortDate(now) };
    case "yesterday":
      return { from: formatShortDate(daysAgo(1)), to: formatShortDate(daysAgo(1)) };
    case "last_7_days":
      return { from: formatShortDate(daysAgo(6)), to: formatShortDate(now) };
    case "this_month":
      return { from: formatShortDate(new Date(now.getFullYear(), now.getMonth(), 1)), to: formatShortDate(now) };
    case "last_month":
      return {
        from: formatShortDate(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
        to: formatShortDate(new Date(now.getFullYear(), now.getMonth(), 0)),
      };
    case "custom":
      return { from: custom.from || "", to: custom.to || "" };
    default:
      return { from: "", to: "" };
  }
};

// "2026-11-01" -> "1 Nov 2026"
const shortDay = (day) => new Date(`${day}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

// The dates a period covers: "1 Nov 2026 – 3 Nov 2026", one date, or "Every day so far"
export const rangeText = ({ from, to }) => {
  if (!from && !to) return "Every day so far";
  if (from === to) return shortDay(from);
  return `${from ? shortDay(from) : "Start"} – ${to ? shortDay(to) : "Today"}`;
};
