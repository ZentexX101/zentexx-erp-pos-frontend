import { roundTaka } from "./number";
import { servicePrice } from "./serviceSale";

// A POS cart line, from a stock row: { stock, quantity, serials, productCode, unitPrice, services } (inputs are strings)
// IMEI products are counted by their picked serials; others by quantity, with an optional typed IMEI / product ID.
// services: the service options sold with the line ({ _id, name, pricePercent, incentivePercent }); each covers every piece.
export const newCartLine = (stock, serial) => ({
  stock,
  quantity: "1",
  serials: serial ? [serial] : [],
  productCode: "",
  unitPrice: String(stock.salePrice ?? ""),
  services: [],
});

export const cartLineQuantity = (line) => (line.stock.product.trackSerial ? line.serials.length : Number(line.quantity) || 0);

// The products alone (quantity x selling price)
export const cartLineProductTotal = (line) => roundTaka(cartLineQuantity(line) * (Number(line.unitPrice) || 0));

// One service on a line: a percent of the line's selling price, for every piece (same maths as the backend)
export const cartServicePrice = (line, service) => servicePrice(Number(line.unitPrice) || 0, service.pricePercent, cartLineQuantity(line));

export const cartLineServiceTotal = (line) =>
  roundTaka((line.services ?? []).reduce((sum, service) => sum + cartServicePrice(line, service), 0));

// Products + the services sold with them
export const cartLineTotal = (line) => roundTaka(cartLineProductTotal(line) + cartLineServiceTotal(line));

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
    services: (line.services ?? []).map((service) => service._id),
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

// A product card was clicked: add it, or take it out when it's already in the cart
export const toggleInCart = (lines, stock) =>
  lines.some((line) => line.stock.product._id === stock.product._id)
    ? lines.filter((line) => line.stock.product._id !== stock.product._id)
    : [...lines, newCartLine(stock)];
