export const PRE_ORDER_STATUS = {
  booked: { label: "Waiting for stock", tone: "slate" },
  sold: { label: "Sold", tone: "green" },
  cancelled: { label: "Cancelled", tone: "red" },
};

// The tabs above the list. "ready": booked, with stock here for it
export const PRE_ORDER_TABS = [
  { key: "booked", label: "Booked" },
  { key: "ready", label: "Stock arrived" },
  { key: "sold", label: "Sold" },
  { key: "cancelled", label: "Cancelled" },
  { key: "", label: "All" },
];

export const HISTORY_LABELS = {
  booked: "Booked",
  notified: "Customer told it arrived",
  sold: "Sold",
  cancelled: "Cancelled",
};
