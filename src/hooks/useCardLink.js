import { useCallback } from "react";
import { isMainAdmin } from "../constants/roles";
import { ROUTES } from "../constants/routes";
import { hasPermission } from "../utils/access";
import { useAuth } from "./useAuth";
import { useBranch } from "./useBranch";

// Where each dashboard card (and notification) leads: the branch page, the main-panel page (all branches),
// and the permission it needs
export const CARD_PAGES = {
  sales: { branch: ROUTES.BRANCH_SALES, permission: "sales.view" },
  posReturns: { branch: ROUTES.BRANCH_POS_RETURNS, permission: "return.view" },
  exchanges: { branch: ROUTES.BRANCH_EXCHANGES, permission: "return.view" },
  serviceSales: { branch: ROUTES.BRANCH_SERVICE_SALES, permission: "sales.view" },
  preOrders: { branch: ROUTES.BRANCH_PRE_ORDERS, permission: "pre_order.view" },
  repairs: { branch: ROUTES.BRANCH_REPAIRS, permission: "repair.view" },
  purchases: { branch: ROUTES.BRANCH_PURCHASES, permission: "purchase.view" },
  purchaseReturns: { branch: ROUTES.BRANCH_PURCHASE_RETURNS, permission: "purchase.view" },
  expenses: { branch: ROUTES.BRANCH_EXPENSES, permission: "expense.view" },
  stock: { branch: ROUTES.BRANCH_STOCK, main: ROUTES.STOCK_CENTER, permission: "stock.view" },
  paymentMethods: { branch: ROUTES.BRANCH_PAYMENT_METHODS, permission: "payment_method.view" },
  transfers: { branch: ROUTES.BRANCH_TRANSFERS, main: ROUTES.TRANSFERS, permission: "transfer.view" },
  supplierPayments: { branch: ROUTES.BRANCH_SUPPLIER_PAYMENTS, main: ROUTES.SUPPLIER_PAYMENTS, permission: "payment.view" },
  customerPayments: { branch: ROUTES.BRANCH_CUSTOMER_PAYMENTS, main: ROUTES.CUSTOMER_PAYMENTS, permission: "payment.view" },
  customerPayouts: { branch: ROUTES.BRANCH_CUSTOMER_PAYOUTS, main: ROUTES.CUSTOMER_PAYOUTS, permission: "payment.view" },
  suppliers: { main: ROUTES.SUPPLIERS, permission: "supplier.view" },
  customers: { main: ROUTES.CUSTOMERS, permission: "customer.view" },
  products: { main: ROUTES.PRODUCTS, permission: "product.view" },
  leaves: { branch: ROUTES.BRANCH_HR_LEAVES, permission: "hr.view" },
  attendance: { branch: ROUTES.BRANCH_HR_ATTENDANCE, permission: "hr.view" },
  branches: { main: ROUTES.BRANCHES },
  staff: { main: ROUTES.STAFF },
};

// linkTo(key) -> { to, onClick } for a card, or undefined when there is no page this user can open.
// inBranch: the dashboard of the branch being worked in. branch: the branch picked on the main
// dashboard ({ _id, name }), if any.
// - inside a branch: the branch page
// - main dashboard: the all-branch page if there is one; otherwise, with a branch picked, that branch's
//   page (the admin enters the branch on the way, like "Login" on the branch list)
// - main-panel pages are for main admins only
export const useCardLink = ({ inBranch, branch }) => {
  const { user } = useAuth();
  const { enterBranch } = useBranch();
  const mainAdmin = isMainAdmin(user);

  return useCallback(
    (key) => {
      const page = CARD_PAGES[key];
      if (!page || (page.permission && !hasPermission(user, page.permission))) return undefined;
      if (inBranch) return page.branch ? { to: page.branch } : mainAdmin && page.main ? { to: page.main } : undefined;
      if (!mainAdmin) return undefined;
      if (page.main) return { to: page.main };
      if (page.branch && branch) return { to: page.branch, onClick: () => enterBranch(branch) };
      return undefined;
    },
    [user, mainAdmin, inBranch, branch, enterBranch],
  );
};
