// Barcode label sizes and helpers (Stock > Barcode Labels).
// Thermal: one label per printed page, the page is the label (Xprinter, TSC… label rolls).
// A4: a sheet of ready-cut stickers; the numbers match the common Avery-style sheets.
export const LABEL_SIZES = [
  { id: "t38x25", kind: "thermal", label: "38 × 25 mm", hint: "Thermal roll", width: 38, height: 25 },
  { id: "t40x30", kind: "thermal", label: "40 × 30 mm", hint: "Thermal roll", width: 40, height: 30 },
  { id: "t50x25", kind: "thermal", label: "50 × 25 mm", hint: "Thermal roll", width: 50, height: 25 },
  { id: "t50x30", kind: "thermal", label: "50 × 30 mm", hint: "Thermal roll", width: 50, height: 30 },
  {
    id: "a4x65",
    kind: "sheet",
    label: "A4 · 65 labels",
    hint: "38.1 × 21.2 mm stickers",
    width: 38.1,
    height: 21.2,
    columns: 5,
    rows: 13,
    top: 10.7,
    left: 4.75,
    gapX: 2.5,
    gapY: 0,
  },
  {
    id: "a4x24",
    kind: "sheet",
    label: "A4 · 24 labels",
    hint: "63.5 × 33.9 mm stickers",
    width: 63.5,
    height: 33.9,
    columns: 3,
    rows: 8,
    top: 12.9,
    left: 6.45,
    gapX: 2.5,
    gapY: 0,
  },
];

export const labelSize = (id) => LABEL_SIZES.find((size) => size.id === id) ?? LABEL_SIZES[0];

export const DEFAULT_LABEL_SETTINGS = {
  size: "a4x65", // a normal printer is the common case; label-printer owners pick their roll size once
  cutLines: true,
  showTopText: true,
  showPrice: true,
};

// At most this many labels in one print (a long thermal job is better split anyway)
export const MAX_LABELS = 2000;
export const MAX_COPIES = 500;

// A valid EAN-13 (our own codes, and most box barcodes) prints as EAN-13; anything else as Code 128
export const isEan13 = (code) => {
  if (!/^\d{13}$/.test(code)) return false;
  const sum = [...code.slice(0, 12)].reduce((total, digit, i) => total + Number(digit) * (i % 2 === 0 ? 1 : 3), 0);
  return (10 - (sum % 10)) % 10 === Number(code[12]);
};

export const barcodeFormat = (code) => (isEan13(code) ? "EAN13" : "CODE128");

// The labels in print order: each item repeated `copies` times
export const expandLabels = (items) => items.flatMap((item) => Array.from({ length: Number(item.copies) || 0 }, (_, i) => ({ ...item, n: i })));

// The settings are a per-device convenience (each counter has its own printer), so they live in localStorage
const STORAGE_KEY = "zentexx.barcodeLabels";

export const loadLabelSettings = () => {
  try {
    return { ...DEFAULT_LABEL_SETTINGS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") };
  } catch {
    return DEFAULT_LABEL_SETTINGS;
  }
};

export const saveLabelSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // private window / blocked storage: the settings just aren't remembered
  }
};
