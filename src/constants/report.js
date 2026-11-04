// Where money came from / went to on the Daily Statement (keys from the backend's report service)
export const FLOW_LABELS = {
  pos_sale: "POS Sales",
  exchange: "Exchange Sales",
  service_sale: "Service Sales",
  replacement: "Replacement Charges",
  customer_payment: "Customer Payments",
  purchase_return: "Purchase Returns",
  cash_in: "Cash In",
  initial_balance: "Opening Balance Added",
  balance_adjustment: "Balance Adjustment",
  sale_return: "POS Return Refunds",
  customer_payout: "Customer Payouts",
  exchange_payout: "Exchange Payouts",
  purchase: "Purchases",
  supplier_payment: "Supplier Payments",
  expense: "Expenses",
  salary: "Salaries",
  salary_advance: "Salary Advances",
  cash_out: "Cash Out",
};

// Expense categories as words
export const EXPENSE_LABELS = {
  rent: "Rent",
  utility: "Utility",
  salary: "Salary",
  transport: "Transport",
  food: "Food",
  courier: "Courier",
  marketing: "Marketing",
  maintenance: "Maintenance",
  tax: "Tax",
  product: "Product (stock used)",
  other: "Other",
};
