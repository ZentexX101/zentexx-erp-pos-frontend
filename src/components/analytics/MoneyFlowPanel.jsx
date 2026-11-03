import { LuBanknote, LuHandCoins, LuHourglass, LuLandmark, LuUndo2 } from "react-icons/lu";
import { TILE_TINTS } from "../../constants/chart";
import { ROUTES } from "../../constants/routes";
import { countLabel, pageFor } from "../../utils/analytics";
import { formatTaka } from "../../utils/money";
import StatPanel, { StatTile } from "./ui/StatPanel";

// Where money stands and moved: cash now, what's owed to suppliers, and the payments of the period
const MoneyFlowPanel = ({ cash, purchases, purchaseReturns, payments, inBranch, periodLabel }) => (
  <StatPanel icon={LuBanknote} title="Money flow" hint={periodLabel}>
    <StatTile
      icon={LuLandmark}
      tone={TILE_TINTS.green}
      label="Cash & Accounts"
      value={formatTaka(cash.balance)}
      hint={`${countLabel(cash.methods, "method")} · right now`}
      to={pageFor(inBranch, ROUTES.BRANCH_PAYMENT_METHODS)}
    />
    <StatTile icon={LuHourglass} tone={TILE_TINTS.red} label="Purchase Due" value={formatTaka(purchases.due)} hint="Unpaid at purchase" />
    <StatTile
      icon={LuUndo2}
      tone={TILE_TINTS.slate}
      label="Purchase Return"
      value={formatTaka(purchaseReturns.total)}
      hint={countLabel(purchaseReturns.count, "return")}
      to={pageFor(inBranch, ROUTES.BRANCH_PURCHASE_RETURNS)}
    />
    <StatTile
      icon={LuBanknote}
      tone={TILE_TINTS.purple}
      label="Supplier Payments"
      value={formatTaka(payments.supplier.amount)}
      hint={countLabel(payments.supplier.count, "payment")}
      to={pageFor(inBranch, ROUTES.BRANCH_SUPPLIER_PAYMENTS, ROUTES.SUPPLIER_PAYMENTS)}
    />
    <StatTile
      icon={LuHandCoins}
      tone={TILE_TINTS.green}
      label="Customer Payments"
      value={formatTaka(payments.customerIn.amount)}
      hint={countLabel(payments.customerIn.count, "payment")}
      to={pageFor(inBranch, ROUTES.BRANCH_CUSTOMER_PAYMENTS, ROUTES.CUSTOMER_PAYMENTS)}
    />
    <StatTile
      icon={LuHandCoins}
      tone={TILE_TINTS.amber}
      label="Customer Payouts"
      value={formatTaka(payments.customerOut.amount)}
      hint={countLabel(payments.customerOut.count, "payout")}
      to={pageFor(inBranch, ROUTES.BRANCH_CUSTOMER_PAYOUTS, ROUTES.CUSTOMER_PAYOUTS)}
    />
  </StatPanel>
);

export default MoneyFlowPanel;
