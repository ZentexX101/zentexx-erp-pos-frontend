export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  return `${monthNames[monthIndex]} ${day}, ${year}`;
};

// 2026-09-29 (local date)
export const formatShortDate = (dateString) => {
  const date = new Date(dateString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// 2026-10-27 20:15 (local date and time)
export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${formatShortDate(dateString)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// Today as 2026-10-28, for <input type="date"> values
export const todayInputValue = () => formatShortDate(new Date());
