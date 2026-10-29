// Must match the backend (src/modules/customer/customer.constants.js)
export const CUSTOMER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

// Balance is one signed number: positive = the customer pays us (red), negative = we pay the customer (green)
export const BALANCE_TYPE = {
  TO_PAY: "to_pay",
  TO_RECEIVE: "to_receive",
};

// Ledger line types. Must match LEDGER_TYPE in the backend.
// Debit raises what the customer owes us, credit lowers it.
export const LEDGER_TYPE = {
  INITIAL_BALANCE: "initial_balance",
  BALANCE_ADJUSTMENT: "balance_adjustment",
  SALE: "sale",
  SALE_RETURN: "sale_return",
  PAYMENT: "payment",
  PAYOUT: "payout",
};

export const LEDGER_TYPE_LABELS = {
  [LEDGER_TYPE.INITIAL_BALANCE]: { label: "Initial Balance", tone: "slate" },
  [LEDGER_TYPE.BALANCE_ADJUSTMENT]: { label: "Balance Adjustment", tone: "purple" },
  [LEDGER_TYPE.SALE]: { label: "Sale", tone: "blue" },
  [LEDGER_TYPE.SALE_RETURN]: { label: "Sale Return", tone: "amber" },
  [LEDGER_TYPE.PAYMENT]: { label: "Payment Received", tone: "green" },
  [LEDGER_TYPE.PAYOUT]: { label: "Payout", tone: "red" },
};
