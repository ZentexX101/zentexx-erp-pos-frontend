import { roundTaka } from "./number";

// Lines of the "Payment Methods & Amounts" box: { key, paymentMethod, amount } (inputs are strings)

export const newPaymentLine = () => ({ key: crypto.randomUUID(), paymentMethod: "", amount: "" });

export const paymentLinesTotal = (lines) => roundTaka(lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0));

// First problem in the lines, or "".
export const paymentLinesError = (lines) => {
  const filled = lines.filter((line) => line.paymentMethod || line.amount);
  if (!filled.length) return "Add a payment method and amount.";
  if (filled.some((line) => !line.paymentMethod)) return "Select a payment method on every line.";
  if (filled.some((line) => !(Number(line.amount) > 0))) return "Enter an amount on every line.";
  return "";
};

// Lines ready for the API: [{ paymentMethod, amount }]
export const toPaymentItems = (lines) =>
  lines.filter((line) => line.paymentMethod || line.amount).map((line) => ({ paymentMethod: line.paymentMethod, amount: Number(line.amount) }));
