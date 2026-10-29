import { roundTaka } from "./number";

// Picks on the POS Return form, per sale item: { [productId]: { quantity: "", serials: [] } }

// Share of the sub total actually charged: the invoice discount is spread over every piece
const priceShare = (sale) => (sale.subTotal > 0 ? (sale.subTotal - sale.discount) / sale.subTotal : 1);

// What one returned piece of this item is worth (same rounding as the backend)
export const returnUnitPrice = (sale, item) => roundTaka(item.unitPrice * priceShare(sale));

// Pieces of an item that can still come back
export const returnableQuantity = (item) => item.quantity - item.returnedQuantity;
export const returnableSerials = (item) => item.serials.filter((serial) => !item.returnedSerials.includes(serial));

export const pickQuantity = (item, pick) => (item.trackSerial ? pick?.serials.length ?? 0 : Number(pick?.quantity) || 0);

export const returnTotal = (sale, picks) =>
  roundTaka(sale.items.reduce((sum, item) => sum + returnUnitPrice(sale, item) * pickQuantity(item, picks[item.product]), 0));

// First problem with the picks, or ""
export const returnPicksError = (sale, picks) => {
  const picked = sale.items.filter((item) => pickQuantity(item, picks[item.product]) > 0);
  if (!picked.length) return "Pick what's being returned.";
  const tooMany = picked.find((item) => !item.trackSerial && pickQuantity(item, picks[item.product]) > returnableQuantity(item));
  if (tooMany) return `Only ${returnableQuantity(tooMany)} of "${tooMany.name}" can still be returned.`;
  return "";
};

// Picks -> API items (only the picked ones)
export const toReturnItems = (sale, picks) =>
  sale.items
    .filter((item) => pickQuantity(item, picks[item.product]) > 0)
    .map((item) =>
      item.trackSerial
        ? { product: item.product, serials: picks[item.product].serials }
        : { product: item.product, quantity: Number(picks[item.product].quantity) }
    );

// Suggested cash back: a customer's due is cleared first, the rest is refunded. Walk-in = all of it.
export const suggestedRefund = (sale, total) => {
  if (!sale.customer) return total;
  const owes = sale.customer.balance > 0 ? sale.customer.balance : 0;
  return roundTaka(Math.max(0, total - owes));
};
