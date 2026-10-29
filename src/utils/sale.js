import { roundTaka } from "./number";

// A POS cart line, from a stock row: { stock, quantity, serials, unitPrice } (inputs are strings)
// IMEI products are counted by their picked serials; others by quantity.
export const newCartLine = (stock, serial) => ({
  stock,
  quantity: "1",
  serials: serial ? [serial] : [],
  unitPrice: String(stock.salePrice ?? ""),
});

export const cartLineQuantity = (line) => (line.stock.product.trackSerial ? line.serials.length : Number(line.quantity) || 0);

export const cartLineTotal = (line) => roundTaka(cartLineQuantity(line) * (Number(line.unitPrice) || 0));

export const cartSubTotal = (lines) => roundTaka(lines.reduce((sum, line) => sum + cartLineTotal(line), 0));

// First problem in the cart, or ""
export const cartError = (lines) => {
  if (!lines.length) return "Add at least one product.";
  for (const line of lines) {
    const { name, trackSerial } = line.stock.product;
    const quantity = cartLineQuantity(line);
    if (quantity < 1) return trackSerial ? `Pick the IMEI of "${name}".` : `Enter the quantity of "${name}".`;
    if (!trackSerial && quantity > line.stock.quantity) return `Only ${line.stock.quantity} of "${name}" in stock.`;
    if (line.unitPrice === "") return `Enter the selling price of "${name}".`;
  }
  return "";
};

// Cart lines -> API items
export const toSaleItems = (lines) =>
  lines.map((line) => ({
    product: line.stock.product._id,
    ...(line.stock.product.trackSerial ? { serials: line.serials } : { quantity: Number(line.quantity) }),
    unitPrice: Number(line.unitPrice),
  }));
