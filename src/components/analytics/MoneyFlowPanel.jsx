import { LuBanknote, LuHandCoins, LuHourglass, LuLandmark, LuUndo2 } from "react-icons/lu";
import { TILE_TINTS } from "../../constants/chart";
import { countLabel } from "../../utils/analytics";
import { formatTaka } from "../../utils/money";
import StatPanel, { StatTile } from "./ui/StatPanel";

// Where money stands and moved: cash now, what's owed to suppliers, and the payments of the period
const MoneyFlowPanel = ({ cash, purchases, purchaseReturns, payments, linkTo, periodLabel }) => (
  <StatPanel icon={LuBanknote} title="Money flow" hint={periodLabel}>
    <StatTile
      icon={LuLandmark}
      tone={TILE_TINTS.green}
      label="Cash & Accounts"
      link={linkTo("paymentMethods")}
      value={formatTaka(cash.balance)}
      hint={`${countLabel(cash.methods, "method")} · right now`}
    />
    <StatTile
      icon={LuHourglass}
      tone={TILE_TINTS.red}
      label="Purchase Due"
      link={linkTo("purchases")}
      value={formatTaka(purchases.due)}
      hint="Unpaid at purchase"
    />
    <StatTile
      icon={LuUndo2}
      tone={TILE_TINTS.slate}
      label="Purchase Return"
      link={linkTo("purchaseReturns")}
      value={formatTaka(purchaseReturns.total)}
      hint={countLabel(purchaseReturns.count, "return")}
    />
    <StatTile
      icon={LuBanknote}
      tone={TILE_TINTS.purple}
      label="Supplier Payments"
      link={linkTo("supplierPayments")}
      value={formatTaka(payments.supplier.amount)}
      hint={countLabel(payments.supplier.count, "payment")}
    />
    <StatTile
      icon={LuHandCoins}
      tone={TILE_TINTS.green}
      label="Customer Payments"
      link={linkTo("customerPayments")}
      value={formatTaka(payments.customerIn.amount)}
      hint={countLabel(payments.customerIn.count, "payment")}
    />
    <StatTile
      icon={LuHandCoins}
      tone={TILE_TINTS.amber}
      label="Customer Payouts"
      link={linkTo("customerPayouts")}
      value={formatTaka(payments.customerOut.amount)}
      hint={countLabel(payments.customerOut.count, "payout")}
    />
  </StatPanel>
);

export default MoneyFlowPanel;
