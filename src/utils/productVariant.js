// Same rules as the backend (src/modules/product/product.variant.js), so the preview shows the exact name that gets saved

export const VARIANT_FIELDS = ["color", "ram", "storage", "region"];

const clean = (value) => (typeof value === "string" && value.trim() ? value.trim() : null);

export const toVariant = (variant = {}) => Object.fromEntries(VARIANT_FIELDS.map((field) => [field, clean(variant?.[field])]));

// "8GB" + "256GB" -> "8/256GB"
const memoryOf = ({ ram, storage }) => {
  if (ram && storage) return /gb$/i.test(ram) && /(gb|tb)$/i.test(storage) ? `${ram.replace(/gb$/i, "")}/${storage}` : `${ram}/${storage}`;
  return ram || storage || null;
};

// "iPhone 15 8/256GB Black (CN)"
export const variantName = (model, variant = {}) =>
  [model.trim(), memoryOf(variant), variant.color, variant.region ? `(${variant.region})` : null].filter(Boolean).join(" ");

// The variant as an invoice line: "Color: Black · RAM: 8GB · ROM: 256GB · Region: CN" ("" when there's none)
const DETAIL_LABELS = { color: "Color", ram: "RAM", storage: "ROM", region: "Region" };
export const variantDetails = (variant) =>
  VARIANT_FIELDS.filter((field) => variant?.[field])
    .map((field) => `${DETAIL_LABELS[field]}: ${variant[field]}`)
    .join(" · ");
