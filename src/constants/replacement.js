// What became of the faulty piece
export const REPLACEMENT_STATUS = {
  damaged: { label: "Damaged, kept aside", tone: "amber" },
  restocked: { label: "Back in stock", tone: "green" },
  written_off: { label: "Written off", tone: "slate" },
};

export const REPLACEMENT_STATUS_OPTIONS = Object.entries(REPLACEMENT_STATUS).map(([value, { label }]) => ({ value, label }));
