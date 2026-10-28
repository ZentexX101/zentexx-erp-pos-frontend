import { isMainAdmin } from "./roles";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  NO_BRANCH: "/no-branch",

  // Main admin panel
  DASHBOARD: "/dashboard",
  BRANCHES: "/dashboard/branches",
  STAFF: "/dashboard/staff",
  REGISTRATIONS: "/dashboard/registrations",
  SUPPLIERS: "/dashboard/suppliers",
  CUSTOMERS: "/dashboard/customers",
  CATEGORIES: "/dashboard/categories",
  BRANDS: "/dashboard/brands",
  SERVICES: "/dashboard/services",
  PRODUCTS: "/dashboard/products",
  TRANSFERS: "/dashboard/transfers",
  CHANGE_PASSWORD: "/dashboard/change-password",

  // Branch panel (a branch's own staff, or a main admin who entered the branch)
  BRANCH_HOME: "/branch",
  BRANCH_REPORTS_SALES: "/branch/reports/sales",
  BRANCH_REPORTS_PURCHASE: "/branch/reports/purchase",
  BRANCH_REPORTS_STOCK: "/branch/reports/stock",
  BRANCH_PAYMENT_METHODS: "/branch/payment-methods",
  BRANCH_STOCK: "/branch/stock",
  BRANCH_PURCHASES: "/branch/purchases",
  BRANCH_PURCHASE_RETURNS: "/branch/purchase-returns",
  BRANCH_TRANSFERS: "/branch/transfers",
  BRANCH_EXPENSES: "/branch/expenses",
  BRANCH_SUPPLIER_PAYMENTS: "/branch/supplier-payments",
  BRANCH_CUSTOMER_PAYMENTS: "/branch/customer-payments",
  BRANCH_CUSTOMER_PAYOUTS: "/branch/customer-payouts",
  BRANCH_POS: "/branch/pos",
  BRANCH_SALES: "/branch/sales",
  BRANCH_SERVICE_SALES: "/branch/service-sales",
  BRANCH_PRE_ORDERS: "/branch/pre-orders",
  BRANCH_EXCHANGES: "/branch/exchanges",
  BRANCH_REPLACEMENTS: "/branch/replacements",
  BRANCH_REPAIRS: "/branch/repairs",
  BRANCH_SALARIES: "/branch/salaries",
  BRANCH_CHANGE_PASSWORD: "/branch/change-password",

  NOT_FOUND: "*",
};

// Where a user lands after logging in
export const getHomePath = (user) => {
  if (isMainAdmin(user)) return ROUTES.DASHBOARD;
  if (user?.branch) return ROUTES.BRANCH_HOME;
  return ROUTES.NO_BRANCH;
};
