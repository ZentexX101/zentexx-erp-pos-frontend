import { roundTaka } from "./number";

// A product we don't have, brought in from elsewhere for one POS sale. It never enters stock.
// { key, name, productCode, quantity, unitCost, unitPrice, supplier: { _id, name } | null, source } (inputs are strings)
// Where it came from: a saved supplier (they're owed the buying price) or just a typed shop name.
export const newExternal = () => ({
  key: crypto.randomUUID(),
  name: "",
  productCode: "",
  quantity: "1",
  unitCost: "",
  unitPrice: "",
  supplier: null,
  source: "",
});

// "from …" text for the cart and details
export const sourceOf = (line) => line.supplier?.name ?? line.supplierName ?? (line.source?.trim() || null);

export const externalQuantity = (line) => Number(line.quantity) || 0;
export const externalTotal = (line) => roundTaka(externalQuantity(line) * (Number(line.unitPrice) || 0));
export const externalCost = (line) => roundTaka(externalQuantity(line) * (Number(line.unitCost) || 0));
export const externalsTotal = (lines) => roundTaka(lines.reduce((sum, line) => sum + externalTotal(line), 0));

// What's wrong with one line, as { field: message } (empty when fine)
export const externalErrors = (line) => {
  const errors = {};
  if (line.name.trim().length < 2) errors.name = "Enter the product name";
  if (externalQuantity(line) < 1) errors.quantity = "At least 1";
  if (line.unitCost === "") errors.unitCost = "Enter what it cost you";
  if (line.unitPrice === "") errors.unitPrice = "Enter the selling price";
  if (!line.supplier && !line.source?.trim()) errors.source = "Pick a supplier or type the shop name";
  return errors;
};

// Lines -> API externalItems
export const toExternalItems = (lines) =>
  lines.map((line) => ({
    name: line.name.trim(),
    productCode: line.productCode.trim(),
    quantity: externalQuantity(line),
    unitCost: Number(line.unitCost),
    unitPrice: Number(line.unitPrice),
    supplier: line.supplier?._id ?? "",
    source: line.supplier ? "" : (line.source ?? "").trim(),
  }));
