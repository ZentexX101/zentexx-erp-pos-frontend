// Every date the app shows goes through here, so they all read the same way:
//   date        5th Nov-2026
//   date + time 8th Nov-2026, 12:12 PM
//   no year     5th Nov              (calendars, short lists)
//   with day    Wednesday, 5th Nov-2026
// Dates sent to the API or put in <input type="date"> stay as 2026-11-05: use toInputDate for those.

export const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// "2026-11-05" is a local calendar day (not UTC midnight); anything else goes to Date as is
// (empty values become an invalid date, so they show "—" instead of 1st Jan-1970)
const toDate = (value) => {
  if (value === null || value === undefined || value === "") return new Date(NaN);
  if (value instanceof Date) return value;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T00:00:00`);
  return new Date(value);
};
const valid = (date) => !Number.isNaN(date.getTime());

// 1st, 2nd, 3rd, 4th … 11th, 12th, 13th … 21st, 22nd, 23rd
export const ordinal = (n) => {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${{ 1: "st", 2: "nd", 3: "rd" }[n % 10] ?? "th"}`;
};

// 5th Nov
export const formatDayMonth = (value) => {
  const date = toDate(value);
  return valid(date) ? `${ordinal(date.getDate())} ${MONTHS_SHORT[date.getMonth()]}` : "—";
};

// 5th Nov-2026
export const formatDate = (value) => {
  const date = toDate(value);
  return valid(date) ? `${formatDayMonth(date)}-${date.getFullYear()}` : "—";
};

// Same as formatDate (kept so older imports keep working)
export const formatShortDate = formatDate;

// 12:12 PM
export const formatTime = (value) => {
  const date = toDate(value);
  if (!valid(date)) return "—";
  const h = date.getHours();
  return `${h % 12 || 12}:${String(date.getMinutes()).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

// 8th Nov-2026, 12:12 PM
export const formatDateTime = (value) => {
  const date = toDate(value);
  return valid(date) ? `${formatDate(date)}, ${formatTime(date)}` : "—";
};

// How long ago: "Just now", "5 min ago", "3 h ago", "Yesterday, 4:10 PM", then "8th Nov-2026, 12:12 PM"
export const formatTimeAgo = (value, now = new Date()) => {
  const date = toDate(value);
  if (!valid(date)) return "—";
  const minutes = Math.floor((now - date) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 6 * 60) return `${Math.floor(minutes / 60)} h ago`;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (date >= startOfToday) return `Today, ${formatTime(date)}`;
  if (date >= new Date(startOfToday.getTime() - 86400000)) return `Yesterday, ${formatTime(date)}`;
  return formatDateTime(date);
};

// Wednesday, 5th Nov-2026 · short: "Wed, 5th Nov" (no year)
export const formatWeekdayDate = (value, { short = false } = {}) => {
  const date = toDate(value);
  if (!valid(date)) return "—";
  const weekday = WEEKDAYS[date.getDay()];
  return short ? `${weekday.slice(0, 3)}, ${formatDayMonth(date)}` : `${weekday}, ${formatDate(date)}`;
};

// Wed (the weekday alone)
export const formatWeekday = (value, { short = true } = {}) => {
  const date = toDate(value);
  if (!valid(date)) return "";
  const weekday = WEEKDAYS[date.getDay()];
  return short ? weekday.slice(0, 3) : weekday;
};

// A month ("2026-11" or a date): "November 2026" · short: "Nov-2026"
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const formatMonth = (value, { short = false } = {}) => {
  const date = typeof value === "string" && /^\d{4}-\d{2}$/.test(value) ? new Date(`${value}-01T00:00:00`) : toDate(value);
  if (!valid(date)) return "—";
  return short ? `${MONTHS_SHORT[date.getMonth()]}-${date.getFullYear()}` : `${MONTHS_LONG[date.getMonth()]} ${date.getFullYear()}`;
};

// A duty time "18:00" as "6:00 PM"
export const formatClockTime = (time) => (time ? formatTime(new Date(`2000-01-01T${time}:00`)) : null);

// 2026-11-05 (local date) — for API params and <input type="date">, never for showing
export const toInputDate = (value) => {
  const date = toDate(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// Today as 2026-10-28, for <input type="date"> values
export const todayInputValue = () => toInputDate(new Date());
