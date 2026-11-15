import { formatDate } from "./formatDate";
import { roundTaka } from "./number";

// Optional notes on an old device's condition
export const NO_CONDITION = { grade: null, box: false, charger: false, note: "" };
export const CONDITION_GRADES = ["A", "B", "C"];

// A used ("Preowned") listing: made from another product, or in a category named like one
const PREOWNED_CATEGORY = /pre\s*-?\s*owned|used|second/i;
export const isPreownedCategory = (category) => PREOWNED_CATEGORY.test(category?.name ?? "");
export const isPreownedProduct = (product) => Boolean(product?.preownedOf) || isPreownedCategory(product?.category);

// An old device on the exchange form (inputs are strings). Each row is one device with an IMEI, or one
// quantity-only product. lookup = what the IMEI lookup said (lookupFor = the IMEI it was for).
export const newTradeIn = () => ({
  key: crypto.randomUUID(),
  serial: "",
  lookup: null,
  lookupFor: "",
  product: null,
  quantity: "1",
  value: "",
  salePrice: "",
  condition: { ...NO_CONDITION },
});

export const tradeInQuantity = (line) => (line.product?.trackSerial ? (line.serial.trim() ? 1 : 0) : Number(line.quantity) || 0);

export const tradeInsTotal = (lines) => roundTaka(lines.reduce((sum, line) => sum + tradeInQuantity(line) * (Number(line.value) || 0), 0));

const hasCondition = (c) => Boolean(c.grade || c.box || c.charger || c.note.trim());

// "Grade B · Box · Charger · cracked back" (for the invoice and lists)
export const conditionText = (condition) => {
  if (!condition) return "";
  return [condition.grade && `Grade ${condition.grade}`, condition.box && "Box", condition.charger && "Charger", condition.note].filter(Boolean).join(" · ");
};

// Where a taken-in device came from, saved with the exchange: "Sold by us · INV-000013, 5th Nov-2026" / "Outside device"
export const tradeInSourceText = (source) => {
  if (!source) return "";
  if (source.kind === "outside") return "Outside device";
  return `Sold by us · ${source.invoiceNo}${source.date ? `, ${formatDate(source.date)}` : ""}`;
};

// First problem with the old devices, or ""
export const tradeInsError = (lines) => {
  if (!lines.some((line) => line.product)) return "Add the customer's old device.";
  for (const line of lines.filter((l) => l.product)) {
    const { name, trackSerial } = line.product;
    if (tradeInQuantity(line) < 1) return trackSerial ? `Enter the IMEI of the old "${name}".` : `Enter the quantity of the old "${name}".`;
    if (line.value === "") return `Enter the exchange value of the old "${name}".`;
    const stocked = trackSerial && line.lookupFor === line.serial.trim().toUpperCase() ? line.lookup?.inStock : null;
    if (stocked) return `IMEI ${line.lookupFor} is already in stock at ${stocked.branch?.name ?? "a branch"}, so it can't be taken in.`;
  }
  const serials = lines.filter((l) => l.product?.trackSerial).map((l) => l.serial.trim().toUpperCase());
  if (new Set(serials).size !== serials.length) return "The same old device IMEI is entered twice.";
  return "";
};

// Rows -> API tradeIns, one line per row (each device keeps its own value and condition)
export const toTradeIns = (lines) =>
  lines
    .filter((line) => line.product)
    .map((line) => {
      const entry = { product: line.product._id, value: Number(line.value) };
      if (line.product.trackSerial) entry.serials = [line.serial.trim().toUpperCase()];
      else entry.quantity = Number(line.quantity);
      if (line.salePrice !== "") entry.salePrice = Number(line.salePrice);
      if (hasCondition(line.condition)) entry.condition = { ...line.condition, note: line.condition.note.trim() || null };
      return entry;
    });
