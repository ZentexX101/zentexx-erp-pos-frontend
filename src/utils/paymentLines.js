import { roundTaka } from "./number";

// Lines of the "Payment Methods & Amounts" box: { key, paymentMethod, amount } (inputs are strings)

export const newPaymentLine = () => ({ key: crypto.randomUUID(), paymentMethod: "", amount: "" });

export const paymentLinesTotal = (lines) => roundTaka(lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0));

// First problem in the lines, or "". checkBalance: money goes out, so each method must have enough.
export const paymentLinesError = (lines, methods, { checkBalance }) => {
  const filled = lines.filter((line) => line.paymentMethod || line.amount);
  if (!filled.length) return "Add a payment method and amount.";
  if (filled.some((line) => !line.paymentMethod)) return "Select a payment method on every line.";
  if (filled.some((line) => !(Number(line.amount) > 0))) return "Enter an amount on every line.";
  if (checkBalance) {
    const byId = new Map(methods.map((m) => [m._id, m]));
    const short = filled.find((line) => Number(line.amount) > (byId.get(line.paymentMethod)?.balance ?? 0));
    if (short) return `"${byId.get(short.paymentMethod)?.name}" doesn't have enough balance.`;
  }
  return "";
};

// Lines ready for the API: [{ paymentMethod, amount }]
export const toPaymentItems = (lines) =>
  lines.filter((line) => line.paymentMethod || line.amount).map((line) => ({ paymentMethod: line.paymentMethod, amount: Number(line.amount) }));
