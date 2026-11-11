// How each day / person stands. cell: the calendar colour; short: its letter in the month register; tone: the Badge colour.
export const ATTENDANCE_STATUS = {
  present: { label: "Present", short: "P", tone: "green", cell: "bg-emerald-100 text-emerald-800" },
  late: { label: "Late", short: "L", tone: "amber", cell: "bg-amber-100 text-amber-800" },
  leave: { label: "On leave", short: "V", tone: "blue", cell: "bg-blue-100 text-blue-800" },
  unpaid_leave: { label: "Unpaid leave", short: "U", tone: "purple", cell: "bg-purple-100 text-purple-800" },
  absent: { label: "Absent", short: "A", tone: "red", cell: "bg-red-100 text-red-700" },
  off: { label: "Weekly off", short: "O", tone: "slate", cell: "bg-slate-100 text-slate-500" },
  not_yet: { label: "Not in yet", short: "", tone: "outline", cell: "bg-white text-slate-500" },
  upcoming: { label: "Upcoming", short: "", tone: "outline", cell: "bg-white text-slate-400 ring-1 ring-inset ring-slate-100" },
  before_joining: { label: "Before joining", short: "", tone: "slate", cell: "bg-slate-50 text-slate-300" },
};

// The calendar's key (the states someone looks for)
export const CALENDAR_LEGEND = ["present", "late", "leave", "unpaid_leave", "absent", "off"];

export const LEAVE_TYPES = [
  { value: "casual", label: "Casual leave" },
  { value: "sick", label: "Sick leave" },
  { value: "unpaid", label: "Unpaid leave" },
];
export const leaveTypeLabel = (value) => LEAVE_TYPES.find((type) => type.value === value)?.label ?? value;

export const LEAVE_STATUS_TONE = { pending: "amber", approved: "green", rejected: "red" };

// The attendance calendar: how each kind of day looks (its cell, its pill, the legend swatch)
export const DAY_LOOK = {
  present: { cell: "bg-emerald-50 ring-emerald-300", pill: "bg-emerald-600 text-white", swatch: "bg-emerald-500", label: "On time" },
  late: { cell: "bg-amber-50 ring-amber-300", pill: "bg-amber-500 text-white", swatch: "bg-amber-500", label: "Late" },
  absent: { cell: "bg-red-50 ring-red-300", pill: "bg-red-600 text-white", swatch: "bg-red-500", label: "Absent" },
  off: { cell: "bg-teal-50 ring-teal-300", pill: "bg-teal-600 text-white", swatch: "bg-teal-500", label: "Weekly off" },
  leave: { cell: "bg-blue-50 ring-blue-300", pill: "bg-blue-600 text-white", swatch: "bg-blue-500", label: "On leave" },
  unpaid_leave: { cell: "bg-purple-50 ring-purple-300", pill: "bg-purple-600 text-white", swatch: "bg-purple-500", label: "Unpaid leave" },
  upcoming: { cell: "bg-white ring-slate-200", pill: "", swatch: "", label: "" },
  not_yet: { cell: "bg-white ring-slate-300", pill: "bg-slate-700 text-white", swatch: "", label: "Not in yet" },
  before_joining: { cell: "bg-slate-100 ring-transparent", pill: "", swatch: "", label: "" },
};

// The swatch of each status, for keys and counts outside the calendar (same colours as the cells)
export const daySwatch = (status) => DAY_LOOK[status]?.swatch ?? "";
