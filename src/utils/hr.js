import { formatClockTime, formatDayMonth, formatMonth, formatTime, formatWeekdayDate, todayInputValue } from "./formatDate";

// Months are "YYYY-MM"
export const currentMonth = () => todayInputValue().slice(0, 7);

export const shiftMonth = (month, step) => {
  const [year, m] = month.split("-").map(Number);
  const date = new Date(year, m - 1 + step, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

export const monthLabel = (month) => formatMonth(month);

export const shiftDay = (day, step) => {
  const date = new Date(`${day}T00:00:00`);
  date.setDate(date.getDate() + step);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

// "Wednesday, 11th Nov-2026"
export const dayLabel = (day) => formatWeekdayDate(day);

// "11th Nov"
export const shortDayLabel = (day) => formatDayMonth(day);

// A moment as "9:05 AM", "—" when there's none
export const timeLabel = (moment) => (moment ? formatTime(moment) : "—");

// A moment as the "HH:mm" a time input wants
export const timeInput = (moment) => {
  if (!moment) return "";
  const date = new Date(moment);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

// "10:00" -> "10:00 AM"
export const dutyLabel = (time) => formatClockTime(time);

// Hours and minutes between check in and check out: "8h 10m"
export const workedLabel = (from, to) => {
  if (!from || !to) return null;
  const minutes = Math.round((new Date(to) - new Date(from)) / 60000);
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

export const minutesLabel = (minutes) => (minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`);
