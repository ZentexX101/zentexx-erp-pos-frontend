// A job's steps, in order. Cancelled can happen from any open step.
export const REPAIR_STATUS = {
  received: { label: "Received", tone: "slate" },
  repairing: { label: "Repairing", tone: "blue" },
  ready: { label: "Ready to collect", tone: "amber" },
  delivered: { label: "Delivered", tone: "green" },
  cancelled: { label: "Cancelled", tone: "red" },
};

export const REPAIR_STEPS = ["received", "repairing", "ready", "delivered"];
export const OPEN_STATUSES = ["received", "repairing", "ready"];

// The tabs above the job list; count: which summary number each shows
export const REPAIR_TABS = [
  { key: "open", label: "In shop" },
  { key: "received", label: "Received" },
  { key: "repairing", label: "Repairing" },
  { key: "ready", label: "Ready" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
  { key: "", label: "All" },
];

export const COST_KINDS = {
  part: "Part",
  outside_work: "Outside work",
  other: "Other",
};
export const COST_KIND_OPTIONS = Object.entries(COST_KINDS).map(([value, label]) => ({ value, label }));

// One tap at the counter
export const ACCESSORY_OPTIONS = ["SIM", "Memory card", "Back cover", "Charger", "Box"];
export const COMMON_PROBLEMS = ["Display broken", "Battery", "Not charging", "Speaker", "Mic", "Camera", "Network", "Software", "Water damage"];
export const WARRANTY_PRESETS = [0, 7, 30, 90];
