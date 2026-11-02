import { roundTaka } from "./number";

// Product expense lines: { stock, quantity, units } (units = picked IMEIs [{ serial, cost }])

// What a line costs: each IMEI's own price, otherwise quantity x the stock's buying price
export const expenseLineCost = (line) =>
  roundTaka(
    line.stock.product.trackSerial
      ? line.units.reduce((sum, unit) => sum + unit.cost, 0)
      : (Number(line.quantity) || 0) * (line.stock.purchasePrice ?? 0)
  );

export const expenseLinesCost = (lines) => roundTaka(lines.reduce((sum, line) => sum + expenseLineCost(line), 0));

// First problem with the lines, or ""
export const expenseLinesError = (lines) => {
  if (!lines.length) return "Add a product.";
  const bad = lines.find((line) => (line.stock.product.trackSerial ? !line.units.length : !(Number(line.quantity) > 0)));
  if (bad) return bad.stock.product.trackSerial ? `Tick the IMEI of "${bad.stock.product.name}".` : `Enter the quantity of "${bad.stock.product.name}".`;
  const tooMany = lines.find((line) => !line.stock.product.trackSerial && Number(line.quantity) > line.stock.quantity);
  return tooMany ? `Only ${tooMany.stock.quantity} of "${tooMany.stock.product.name}" in stock.` : "";
};

// Lines -> API items
export const toExpenseItems = (lines) =>
  lines.map((line) =>
    line.stock.product.trackSerial
      ? { product: line.stock.product._id, serials: line.units.map((unit) => unit.serial) }
      : { product: line.stock.product._id, quantity: Number(line.quantity) }
  );
