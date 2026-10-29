// Must match the backend (src/modules/paymentMethod/paymentMethod.constants.js)
export const PAYMENT_METHOD_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

// Ledger line types with their statement label and badge tone
export const LEDGER_TYPE_LABELS = {
  initial_balance: { label: "Initial Balance", tone: "slate" },
  balance_adjustment: { label: "Balance Adjustment", tone: "purple" },
  cash_in: { label: "Cash In", tone: "green" },
  cash_out: { label: "Cash Out", tone: "red" },
  sale: { label: "Sale", tone: "blue" },
  sale_return: { label: "Sale Return", tone: "amber" },
  customer_payment: { label: "Customer Payment", tone: "green" },
  customer_payout: { label: "Customer Payout", tone: "red" },
  purchase: { label: "Purchase", tone: "blue" },
  purchase_return: { label: "Purchase Return", tone: "amber" },
  supplier_payment: { label: "Supplier Payment", tone: "red" },
  expense: { label: "Expense", tone: "red" },
  salary: { label: "Salary", tone: "purple" },
};
