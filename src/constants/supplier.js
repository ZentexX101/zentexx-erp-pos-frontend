// Must match the backend (src/modules/supplier/supplier.constants.js)
export const SUPPLIER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

// Balance is one signed number: positive = we pay the supplier (green), negative = the supplier pays us (red)
export const BALANCE_TYPE = {
  TO_PAY: "to_pay",
  TO_RECEIVE: "to_receive",
};

// Ledger line types. Must match LEDGER_TYPE in the backend.
// Credit raises what we owe the supplier, debit lowers it.
export const LEDGER_TYPE = {
  INITIAL_BALANCE: "initial_balance",
  BALANCE_ADJUSTMENT: "balance_adjustment",
  PURCHASE: "purchase",
  PURCHASE_RETURN: "purchase_return",
  PAYMENT: "payment",
};

export const LEDGER_TYPE_LABELS = {
  [LEDGER_TYPE.INITIAL_BALANCE]: { label: "Initial Balance", tone: "slate" },
  [LEDGER_TYPE.BALANCE_ADJUSTMENT]: { label: "Balance Adjustment", tone: "purple" },
  [LEDGER_TYPE.PURCHASE]: { label: "Purchase", tone: "blue" },
  [LEDGER_TYPE.PURCHASE_RETURN]: { label: "Purchase Return", tone: "amber" },
  [LEDGER_TYPE.PAYMENT]: { label: "Payment", tone: "green" },
};
