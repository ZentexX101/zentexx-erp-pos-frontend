import { roundTaka } from "./number";

// An old device on the exchange form: { key, product, serial, quantity, value, salePrice } (inputs are strings).
// IMEI products take one device per row (its IMEI); others take a quantity.
export const newTradeIn = () => ({ key: crypto.randomUUID(), product: null, serial: "", quantity: "1", value: "", salePrice: "" });

export const tradeInQuantity = (line) => (line.product?.trackSerial ? (line.serial.trim() ? 1 : 0) : Number(line.quantity) || 0);

export const tradeInsTotal = (lines) => roundTaka(lines.reduce((sum, line) => sum + tradeInQuantity(line) * (Number(line.value) || 0), 0));

// First problem with the old devices, or ""
export const tradeInsError = (lines) => {
  if (!lines.some((line) => line.product)) return "Add the customer's old device.";
  for (const line of lines.filter((l) => l.product)) {
    const { name, trackSerial } = line.product;
    if (tradeInQuantity(line) < 1) return trackSerial ? `Enter the IMEI of the old "${name}".` : `Enter the quantity of the old "${name}".`;
    if (line.value === "") return `Enter the exchange value of the old "${name}".`;
  }
  const serials = lines.filter((l) => l.product?.trackSerial).map((l) => l.serial.trim().toUpperCase());
  if (new Set(serials).size !== serials.length) return "The same old device IMEI is entered twice.";
  // Rows of one product become one line with one value per piece
  const values = new Map();
  for (const line of lines.filter((l) => l.product)) {
    const seen = values.get(line.product._id);
    if (seen !== undefined && seen !== Number(line.value)) return `Old "${line.product.name}" devices need the same exchange value; add them as one row each with equal value.`;
    values.set(line.product._id, Number(line.value));
  }
  return "";
};

// Rows -> API tradeIns. Rows of the same IMEI product are merged into one line with several serials.
export const toTradeIns = (lines) => {
  const byProduct = new Map();
  for (const line of lines.filter((l) => l.product)) {
    const id = line.product._id;
    const entry = byProduct.get(id) ?? { product: id, serials: [], quantity: 0, value: Number(line.value) };
    if (line.product.trackSerial) entry.serials.push(line.serial.trim().toUpperCase());
    else entry.quantity += Number(line.quantity);
    if (line.salePrice !== "") entry.salePrice = Number(line.salePrice);
    byProduct.set(id, entry);
  }
  return [...byProduct.values()].map(({ quantity, serials, ...entry }) => (serials.length ? { ...entry, serials } : { ...entry, quantity }));
};
