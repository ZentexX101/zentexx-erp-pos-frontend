import {
  LuArrowLeftRight,
  LuBadgeDollarSign,
  LuBanknote,
  LuBoxes,
  LuConciergeBell,
  LuCreditCard,
  LuFileText,
  LuGem,
  LuHandCoins,
  LuLayoutDashboard,
  LuListTree,
  LuMonitorSmartphone,
  LuPackage,
  LuReceipt,
  LuRefreshCw,
  LuRepeat,
  LuShoppingBag,
  LuTags,
  LuTruck,
  LuUserRound,
  LuUsers,
  LuWallet,
  LuWrench,
} from "react-icons/lu";
import { REVIEWER_ROLES } from "../constants/roles";
import { ROUTES } from "../constants/routes";
import Brands from "../pages/brand/Brands";
import BranchHome from "../pages/branch/BranchHome";
import Branches from "../pages/branch/Branches";
import Categories from "../pages/category/Categories";
import CustomerLedger from "../pages/customer/CustomerLedger";
import Customers from "../pages/customer/Customers";
import DashboardHome from "../pages/dashboard/DashboardHome";
import PaymentMethodStatement from "../pages/paymentMethod/PaymentMethodStatement";
import PaymentMethods from "../pages/paymentMethod/PaymentMethods";
import Products from "../pages/product/Products";
import Services from "../pages/service/Services";
import Registrations from "../pages/dashboard/Registrations";
import Staff from "../pages/staff/Staff";
import SupplierLedger from "../pages/supplier/SupplierLedger";
import Suppliers from "../pages/supplier/Suppliers";

// One config per panel. The Router builds its routes from it and the Sidebar shows it as the menu.
//
// Item fields:
//   label, icon, path      menu text, react-icon, URL (from ROUTES)
//   page                   page component; leave it out to show "Coming soon" until the module is built
//   end                    only active on the exact path (for the panel home)
//   roles / permission     hide the item (and block its page) unless the user has the role / permission key
//   children               sub menu; the parent is then only a dropdown, without its own page
//
// quickLinks are the shortcut buttons in the top bar.
// hiddenPages get a route but no menu item (pages opened from another page, e.g. a supplier's ledger).

export const MAIN_PANEL = {
  home: ROUTES.DASHBOARD,
  sections: [
    {
      title: "Home",
      items: [{ label: "Dashboard", icon: LuLayoutDashboard, path: ROUTES.DASHBOARD, page: DashboardHome, end: true }],
    },
    {
      title: "Features",
      items: [
        {
          label: "Branch",
          icon: LuListTree,
          children: [{ label: "Branch List", path: ROUTES.BRANCHES, page: Branches }],
        },
        {
          label: "Staff",
          icon: LuUsers,
          children: [
            { label: "Staff List", path: ROUTES.STAFF, page: Staff },
            { label: "Registration Requests", path: ROUTES.REGISTRATIONS, page: Registrations, roles: REVIEWER_ROLES },
          ],
        },
        {
          label: "Supplier",
          icon: LuTruck,
          children: [
            { label: "Supplier List", path: ROUTES.SUPPLIERS, page: Suppliers, permission: "supplier.view" },
            { label: "Supplier Payment Lists", path: ROUTES.SUPPLIER_PAYMENTS, permission: "payment.view" },
          ],
        },
        {
          label: "Customer",
          icon: LuUserRound,
          children: [{ label: "Customer List", path: ROUTES.CUSTOMERS, page: Customers, permission: "customer.view" }],
        },
        {
          label: "Category",
          icon: LuTags,
          children: [{ label: "Category List", path: ROUTES.CATEGORIES, page: Categories, permission: "category.view" }],
        },
        {
          label: "Brand",
          icon: LuGem,
          children: [{ label: "Brand List", path: ROUTES.BRANDS, page: Brands, permission: "brand.view" }],
        },
        {
          label: "Service",
          icon: LuConciergeBell,
          children: [{ label: "Service List", path: ROUTES.SERVICES, page: Services, permission: "service.view" }],
        },
        { label: "All Products", icon: LuPackage, path: ROUTES.PRODUCTS, page: Products, permission: "product.view" },
        { label: "Transfer", icon: LuArrowLeftRight, path: ROUTES.TRANSFERS, permission: "transfer.view" },
      ],
    },
  ],
  quickLinks: [
    { label: "Product", icon: LuPackage, path: ROUTES.PRODUCTS, permission: "product.view" },
    { label: "Branch", icon: LuListTree, path: ROUTES.BRANCHES },
    { label: "Staff", icon: LuUsers, path: ROUTES.STAFF },
    { label: "Supplier", icon: LuTruck, path: ROUTES.SUPPLIERS, permission: "supplier.view" },
    { label: "Customer", icon: LuUserRound, path: ROUTES.CUSTOMERS, permission: "customer.view" },
    { label: "Service", icon: LuConciergeBell, path: ROUTES.SERVICES, permission: "service.view" },
  ],
  hiddenPages: [
    { label: "Supplier Ledger", path: ROUTES.SUPPLIER_LEDGER, page: SupplierLedger, permission: "supplier.view" },
    { label: "Customer Ledger", path: ROUTES.CUSTOMER_LEDGER, page: CustomerLedger, permission: "customer.view" },
  ],
};

export const BRANCH_PANEL = {
  home: ROUTES.BRANCH_HOME,
  sections: [
    {
      title: "Home",
      items: [{ label: "Dashboard", icon: LuLayoutDashboard, path: ROUTES.BRANCH_HOME, page: BranchHome, end: true }],
    },
    {
      title: "Features",
      items: [
        {
          label: "Report",
          icon: LuFileText,
          permission: "report.view",
          children: [
            { label: "Sales Report", path: ROUTES.BRANCH_REPORTS_SALES },
            { label: "Purchase Report", path: ROUTES.BRANCH_REPORTS_PURCHASE },
            { label: "Stock Report", path: ROUTES.BRANCH_REPORTS_STOCK },
          ],
        },
        { label: "Payment Method", icon: LuCreditCard, path: ROUTES.BRANCH_PAYMENT_METHODS, page: PaymentMethods, permission: "payment_method.view" },
        { label: "Stock", icon: LuBoxes, path: ROUTES.BRANCH_STOCK, permission: "stock.view" },
        {
          label: "Purchase",
          icon: LuShoppingBag,
          permission: "purchase.view",
          children: [
            { label: "Purchase List", path: ROUTES.BRANCH_PURCHASES },
            { label: "Purchase Return", path: ROUTES.BRANCH_PURCHASE_RETURNS },
          ],
        },
        { label: "Transfer", icon: LuArrowLeftRight, path: ROUTES.BRANCH_TRANSFERS, permission: "transfer.view" },
        { label: "Expense", icon: LuReceipt, path: ROUTES.BRANCH_EXPENSES, permission: "expense.view" },
        { label: "Supplier Payment", icon: LuWallet, path: ROUTES.BRANCH_SUPPLIER_PAYMENTS, permission: "payment.view" },
        { label: "Customer Payment", icon: LuHandCoins, path: ROUTES.BRANCH_CUSTOMER_PAYMENTS, permission: "payment.view" },
        { label: "Customer Payout", icon: LuBanknote, path: ROUTES.BRANCH_CUSTOMER_PAYOUTS, permission: "payment.view" },
        {
          label: "POS",
          icon: LuMonitorSmartphone,
          permission: "sales.view",
          children: [
            { label: "New Sale", path: ROUTES.BRANCH_POS },
            { label: "Sales List", path: ROUTES.BRANCH_SALES },
            { label: "Service Sales", path: ROUTES.BRANCH_SERVICE_SALES },
          ],
        },
        { label: "Pre Order", icon: LuShoppingBag, path: ROUTES.BRANCH_PRE_ORDERS, permission: "sales.view" },
        { label: "Exchange", icon: LuRepeat, path: ROUTES.BRANCH_EXCHANGES, permission: "return.view" },
        { label: "Replacement", icon: LuRefreshCw, path: ROUTES.BRANCH_REPLACEMENTS, permission: "return.view" },
        { label: "Repair", icon: LuWrench, path: ROUTES.BRANCH_REPAIRS },
        { label: "Salary Management", icon: LuBadgeDollarSign, path: ROUTES.BRANCH_SALARIES },
      ],
    },
  ],
  quickLinks: [
    { label: "Stock", icon: LuBoxes, path: ROUTES.BRANCH_STOCK, permission: "stock.view" },
    { label: "Purchase", icon: LuShoppingBag, path: ROUTES.BRANCH_PURCHASES, permission: "purchase.view" },
    { label: "Sales", icon: LuMonitorSmartphone, path: ROUTES.BRANCH_POS, permission: "sales.view" },
    { label: "Service Sales", icon: LuConciergeBell, path: ROUTES.BRANCH_SERVICE_SALES, permission: "sales.view" },
    { label: "Transfer", icon: LuArrowLeftRight, path: ROUTES.BRANCH_TRANSFERS, permission: "transfer.view" },
    { label: "Expense", icon: LuReceipt, path: ROUTES.BRANCH_EXPENSES, permission: "expense.view" },
    { label: "Customer Payment", icon: LuHandCoins, path: ROUTES.BRANCH_CUSTOMER_PAYMENTS, permission: "payment.view" },
    { label: "Supplier Payment", icon: LuWallet, path: ROUTES.BRANCH_SUPPLIER_PAYMENTS, permission: "payment.view" },
  ],
  hiddenPages: [
    {
      label: "Payment Method Statement",
      path: ROUTES.BRANCH_PAYMENT_METHOD_STATEMENT,
      page: PaymentMethodStatement,
      permission: "payment_method.view",
    },
  ],
};

export const PANELS = { main: MAIN_PANEL, branch: BRANCH_PANEL };

// Every page in a panel (menu items and hiddenPages), with the parent's roles / permission passed down to its children
export const getPanelPages = (panel) => [
  ...panel.sections
    .flatMap((section) => section.items)
    .flatMap((item) =>
      item.children
        ? item.children.map((child) => ({
            ...child,
            roles: child.roles || item.roles,
            permission: child.permission || item.permission,
          }))
        : [item]
    ),
  ...(panel.hiddenPages ?? []),
];
