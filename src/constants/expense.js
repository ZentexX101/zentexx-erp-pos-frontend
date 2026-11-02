// Must match the backend (src/modules/expense/expense.constants.js)
export const EXPENSE_TYPE = {
  GENERAL: "general",
  PRODUCT: "product",
};

export const EXPENSE_CATEGORIES = [
  { value: "rent", label: "Rent (ভাড়া)" },
  { value: "utility", label: "Utility / Bills (বিল)" },
  { value: "salary", label: "Salary / Advance (বেতন)" },
  { value: "transport", label: "Transport (যাতায়াত)" },
  { value: "food", label: "Food / Snacks (নাস্তা)" },
  { value: "courier", label: "Courier" },
  { value: "marketing", label: "Marketing" },
  { value: "maintenance", label: "Maintenance (মেরামত)" },
  { value: "tax", label: "VAT / Tax" },
  { value: "product", label: "Product (stock used)" },
  { value: "other", label: "Other" },
];

export const categoryLabel = (value) => EXPENSE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
