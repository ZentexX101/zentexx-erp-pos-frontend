import { roundTaka } from "./number";
import { parseSerials, repeatedSerials } from "./serials";

// A line of the Add Purchase form: { product, quantity, serialsText, unitCost, salePrice } (inputs are strings)
export const newPurchaseLine = (product) => ({ product, quantity: "1", serialsText: "", unitCost: "", salePrice: "" });

// IMEI products count their serials; others use the quantity input
export const lineQuantity = (line) => (line.product.trackSerial ? parseSerials(line.serialsText).length : Number(line.quantity) || 0);

export const lineTotal = (line) => roundTaka(lineQuantity(line) * (Number(line.unitCost) || 0));

export const linesTotal = (lines) => roundTaka(lines.reduce((sum, line) => sum + lineTotal(line), 0));

// First problem in the lines, or "" when they're ready to send
export const purchaseLinesError = (lines) => {
  if (!lines.length) return "Add at least one product.";
  for (const line of lines) {
    const { name, trackSerial } = line.product;
    if (lineQuantity(line) < 1) return trackSerial ? `Enter the IMEI / serial of each "${name}".` : `Enter the quantity of "${name}".`;
    if (line.unitCost === "") return `Enter the purchase price of "${name}".`;
  }
  const repeated = repeatedSerials(lines.flatMap((line) => (line.product.trackSerial ? parseSerials(line.serialsText) : [])));
  if (repeated.length) return `Entered twice: ${repeated.join(", ")}.`;
  return "";
};

// Form lines -> API items
export const toPurchaseItems = (lines) =>
  lines.map((line) => ({
    product: line.product._id,
    ...(line.product.trackSerial ? { serials: parseSerials(line.serialsText) } : { quantity: Number(line.quantity) }),
    unitCost: Number(line.unitCost),
    salePrice: Number(line.salePrice) || 0,
  }));

// A line of the Purchase Return form, from a stock row: { stock, quantity, unitCost, units }
// units = the picked IMEI pieces [{ serial, purchasePrice }] for IMEI products
export const newReturnLine = (stock) => ({ stock, quantity: "1", unitCost: String(stock.purchasePrice ?? ""), units: [] });

export const returnLineQuantity = (line) => (line.stock.product.trackSerial ? line.units.length : Number(line.quantity) || 0);

// IMEI pieces go back at the price each was bought for
export const returnLineTotal = (line) =>
  roundTaka(
    line.stock.product.trackSerial
      ? line.units.reduce((sum, unit) => sum + unit.purchasePrice, 0)
      : returnLineQuantity(line) * (Number(line.unitCost) || 0)
  );

export const returnLinesTotal = (lines) => roundTaka(lines.reduce((sum, line) => sum + returnLineTotal(line), 0));

export const returnLinesError = (lines) => {
  if (!lines.length) return "Add at least one product.";
  for (const line of lines) {
    const { name, trackSerial } = line.stock.product;
    const quantity = returnLineQuantity(line);
    if (quantity < 1) return trackSerial ? `Tick the IMEIs of "${name}" to return.` : `Enter the quantity of "${name}".`;
    if (!trackSerial && quantity > line.stock.quantity) return `Only ${line.stock.quantity} of "${name}" in stock.`;
    if (!trackSerial && line.unitCost === "") return `Enter the return price of "${name}".`;
  }
  return "";
};

export const toReturnItems = (lines) =>
  lines.map((line) =>
    line.stock.product.trackSerial
      ? { product: line.stock.product._id, serials: line.units.map((unit) => unit.serial) }
      : { product: line.stock.product._id, quantity: Number(line.quantity), unitCost: Number(line.unitCost) }
  );
