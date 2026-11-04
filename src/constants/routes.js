import { isMainAdmin } from "./roles";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  NO_BRANCH: "/no-branch",

  // Main admin panel
  DASHBOARD: "/dashboard",
  BRANCHES: "/dashboard/branches",
  STAFF: "/dashboard/staff",
  REGISTRATIONS: "/dashboard/registrations",
  SUPPLIERS: "/dashboard/suppliers",
  SUPPLIER_PAYMENTS: "/dashboard/supplier-payments",
  SUPPLIER_LEDGER: "/dashboard/suppliers/:id/ledger",
  CUSTOMERS: "/dashboard/customers",
  CUSTOMER_LEDGER: "/dashboard/customers/:id/ledger",
  CUSTOMER_PAYMENTS: "/dashboard/customer-payments",
  CUSTOMER_PAYOUTS: "/dashboard/customer-payouts",
  CATEGORIES: "/dashboard/categories",
  BRANDS: "/dashboard/brands",
  SERVICES: "/dashboard/services",
  PRODUCTS: "/dashboard/products",
  TRANSFERS: "/dashboard/transfers",
  STOCK_CENTER: "/dashboard/stock-center",
  HR_STAFF: "/dashboard/hr/staff",
  HR_STAFF_FILE: "/dashboard/hr/staff/:id",
  REPORT_DAILY: "/dashboard/reports/daily-statement",
  REPORT_PROFIT: "/dashboard/reports/profit-loss",
  SETTINGS: "/dashboard/settings",

  // Branch panel (a branch's own staff, or a main admin who entered the branch)
  BRANCH_HOME: "/branch",
  BRANCH_REPORT_DAILY: "/branch/reports/daily-statement",
  BRANCH_REPORT_PROFIT: "/branch/reports/profit-loss",
  BRANCH_PAYMENT_METHODS: "/branch/payment-methods",
  BRANCH_PAYMENT_METHOD_STATEMENT: "/branch/payment-methods/:id/statement",
  BRANCH_STOCK: "/branch/stock",
  BRANCH_PURCHASE_NEW: "/branch/purchases/new",
  BRANCH_PURCHASES: "/branch/purchases",
  BRANCH_PURCHASE_RETURN_NEW: "/branch/purchase-returns/new",
  BRANCH_PURCHASE_RETURNS: "/branch/purchase-returns",
  BRANCH_TRANSFERS: "/branch/transfers",
  BRANCH_EXPENSES: "/branch/expenses",
  BRANCH_SUPPLIER_PAYMENTS: "/branch/supplier-payments",
  BRANCH_CUSTOMER_PAYMENTS: "/branch/customer-payments",
  BRANCH_CUSTOMER_PAYOUTS: "/branch/customer-payouts",
  BRANCH_POS: "/branch/pos",
  BRANCH_SALES: "/branch/sales",
  BRANCH_POS_RETURN: "/branch/pos-return",
  BRANCH_POS_RETURNS: "/branch/pos-returns",
  BRANCH_SERVICE_SALE_NEW: "/branch/service-sales/new",
  BRANCH_SERVICE_SALES: "/branch/service-sales",
  BRANCH_PRE_ORDERS: "/branch/pre-orders",
  BRANCH_EXCHANGE_NEW: "/branch/exchanges/new",
  BRANCH_EXCHANGES: "/branch/exchanges",
  BRANCH_REPLACEMENT_NEW: "/branch/replacements/new",
  BRANCH_REPLACEMENTS: "/branch/replacements",
  BRANCH_REPAIRS: "/branch/repairs",
  BRANCH_REPAIR_NEW: "/branch/repairs/new",
  BRANCH_REPAIR_DETAIL: "/branch/repairs/:id",
  BRANCH_HR: "/branch/hr",
  BRANCH_HR_STAFF: "/branch/hr/staff",
  BRANCH_HR_STAFF_FILE: "/branch/hr/staff/:id",
  BRANCH_HR_ATTENDANCE: "/branch/hr/attendance",
  BRANCH_HR_LEAVES: "/branch/hr/leaves",
  BRANCH_HR_SALARIES: "/branch/hr/salaries",
  BRANCH_HR_INCENTIVES: "/branch/hr/incentives",
  BRANCH_HR_INCREMENTS: "/branch/hr/increments",
  BRANCH_HR_ADVANCES: "/branch/hr/advances",
  BRANCH_SETTINGS: "/branch/settings",

  NOT_FOUND: "*",
};

// Where a user lands after logging in
export const getHomePath = (user) => {
  if (isMainAdmin(user)) return ROUTES.DASHBOARD;
  if (user?.branch) return ROUTES.BRANCH_HOME;
  return ROUTES.NO_BRANCH;
};

// Paths with an :id
export const supplierLedgerPath = (supplierId) => ROUTES.SUPPLIER_LEDGER.replace(":id", supplierId);
export const repairDetailPath = (id) => ROUTES.BRANCH_REPAIR_DETAIL.replace(":id", id);
export const staffFilePath = (id, inBranch) => (inBranch ? ROUTES.BRANCH_HR_STAFF_FILE : ROUTES.HR_STAFF_FILE).replace(":id", id);
export const paymentMethodStatementPath = (methodId) => ROUTES.BRANCH_PAYMENT_METHOD_STATEMENT.replace(":id", methodId);
export const customerLedgerPath = (customerId) => ROUTES.CUSTOMER_LEDGER.replace(":id", customerId);
