// Customer payment (the customer pays us) and payout (we pay the customer) share one set of
// pages and components; everything that differs lives here. Must match the backend types.
export const CUSTOMER_PAYMENT_KINDS = {
  payment: {
    path: "/customer-payments",
    title: "Customer Payment",
    listTitle: "Customer Payment Lists",
    subtitle: "Money received from customers",
    createLabel: "Create Customer Payment",
    submitLabel: "Create Customer Payment",
    formSubtitle: "Take money from a customer into one or more payment methods",
    linesTitle: "Payment Methods & Amounts",
    addLabel: "Add Payment Method",
    totalLabel: "Total Payment",
    tone: "text-green-600",
    notePlaceholder: "Enter payment note (e.g. Cleared dues via Cash + bKash)",
    noun: "payment",
    // the customer owes us (positive balance): pay it all in one click
    dueOf: (customer) => (customer?.balance > 0 ? customer.balance : 0),
    dueLabel: "Receive full due",
    checkBalance: false, // money comes in
  },
  payout: {
    path: "/customer-payouts",
    title: "Customer Payout",
    listTitle: "Customer Payout Lists",
    subtitle: "Money paid out to customers",
    createLabel: "Create Customer Payout",
    submitLabel: "Create Payment Out",
    formSubtitle: "Pay a customer from one or more payment methods",
    linesTitle: "Payout Methods & Amounts",
    addLabel: "Add Payout Method",
    totalLabel: "Total Payout",
    tone: "text-orange-600",
    notePlaceholder: "Enter payment note or reference (e.g. Exchange phone payout via Cash & Bank)",
    noun: "payout",
    // we owe the customer (negative balance): pay it all in one click
    dueOf: (customer) => (customer?.balance < 0 ? -customer.balance : 0),
    dueLabel: "Pay full amount owed",
    checkBalance: true, // money goes out, so each method needs enough
  },
};
