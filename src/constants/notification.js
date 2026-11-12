import {
  LuAlarmClock,
  LuArrowLeftRight,
  LuBanknote,
  LuBell,
  LuCalendarCheck,
  LuCalendarClock,
  LuHandCoins,
  LuLogIn,
  LuLogOut,
  LuPackageCheck,
  LuPackageMinus,
  LuPackagePlus,
  LuPackageX,
  LuReceipt,
  LuRotateCcw,
  LuShoppingCart,
  LuTimerOff,
  LuTriangleAlert,
  LuUndo2,
  LuWallet,
} from "react-icons/lu";

// The icon of each notification kind (backend: modules/notification/notification.constants.js)
export const NOTIFICATION_ICONS = {
  product_created: LuPackagePlus,
  stock_in: LuPackageCheck,
  purchase_return: LuUndo2,
  stock_expense: LuPackageMinus,
  transfer: LuArrowLeftRight,
  low_stock: LuTriangleAlert,
  out_of_stock: LuPackageX,
  sale: LuShoppingCart,
  sale_due: LuReceipt,
  sale_return: LuRotateCcw,
  expense: LuWallet,
  customer_payment: LuHandCoins,
  customer_payout: LuHandCoins,
  supplier_payment: LuBanknote,
  leave_request: LuCalendarClock,
  leave_decision: LuCalendarCheck,
  late_check_in: LuAlarmClock,
  early_check_out: LuTimerOff,
  check_in: LuLogIn,
  check_out: LuLogOut,
};
export const DEFAULT_NOTIFICATION_ICON = LuBell;

// Icon tile colours per level: warnings and critical ones stand out
export const NOTIFICATION_LEVEL_STYLES = {
  info: "bg-slate-100 text-slate-600",
  warning: "bg-amber-100 text-amber-700",
  critical: "bg-red-100 text-red-700",
};

// Groups, in the order the filter and Settings show them
export const NOTIFICATION_GROUPS = ["Product & Stock", "Sales", "Money", "HR"];
