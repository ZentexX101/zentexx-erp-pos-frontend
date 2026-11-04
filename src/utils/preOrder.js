import { roundTaka } from "./number";

// "Galaxy A37" / "2 × Galaxy A37" / "Galaxy A37 + 2 more"
export const preOrderTitle = (row) => {
  const [first, ...rest] = row.items;
  if (!first) return "Old booking (run the pre order update)";
  const name = `${first.quantity > 1 ? `${first.quantity} × ` : ""}${first.name}`;
  return rest.length ? `${name} + ${rest.length} more` : name;
};

// Cart lines: { product: { _id, name, image, trackSerial }, quantity, unitPrice } (inputs are strings)
export const cartLineTotal = (line) => roundTaka((Number(line.quantity) || 0) * (Number(line.unitPrice) || 0));
export const cartSubTotal = (lines) => roundTaka(lines.reduce((sum, line) => sum + cartLineTotal(line), 0));

// Clicking a product again adds one more
export const addToCart = (lines, product) =>
  lines.some((line) => line.product._id === product._id)
    ? lines.map((line) => (line.product._id === product._id ? { ...line, quantity: String((Number(line.quantity) || 0) + 1) } : line))
    : [...lines, { product, quantity: "1", unitPrice: product.salePrice ? String(product.salePrice) : "" }];

// First problem in the cart, or ""
export const cartError = (lines) => {
  if (!lines.length) return "Add at least one product.";
  const noQuantity = lines.find((line) => !(Number(line.quantity) >= 1));
  if (noQuantity) return `Enter how many "${noQuantity.product.name}".`;
  const noPrice = lines.find((line) => line.unitPrice === "");
  if (noPrice) return `Enter the price of "${noPrice.product.name}".`;
  return "";
};

export const toCartItems = (lines) => lines.map((line) => ({ product: line.product._id, quantity: Number(line.quantity), unitPrice: Number(line.unitPrice) }));
