import { roundTaka } from "./number";

// A POS cart line, from a stock row: { stock, quantity, serials, productCode, unitPrice } (inputs are strings)
// IMEI products are counted by their picked serials; others by quantity, with an optional typed IMEI / product ID.
export const newCartLine = (stock, serial) => ({
  stock,
  quantity: "1",
  serials: serial ? [serial] : [],
  productCode: "",
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
    ...(line.stock.product.trackSerial ? { serials: line.serials } : { quantity: Number(line.quantity), productCode: (line.productCode ?? "").trim() }),
    unitPrice: Number(line.unitPrice),
  }));

// Cart after adding a product card (one more piece) or a scanned IMEI (that exact piece)
export const addToCart = (lines, stock, serial) => {
  const index = lines.findIndex((line) => line.stock.product._id === stock.product._id);
  if (index === -1) return [...lines, newCartLine(stock, serial)];
  return lines.map((line, i) => {
    if (i !== index) return line;
    if (stock.product.trackSerial) return serial && !line.serials.includes(serial) ? { ...line, serials: [...line.serials, serial] } : line;
    return { ...line, quantity: String(Math.min((Number(line.quantity) || 0) + 1, stock.quantity)) };
  });
};
