import { LuGift, LuHourglass, LuRepeat, LuShoppingCart, LuTag, LuUndo2, LuWallet } from "react-icons/lu";
import { TILE_TINTS } from "../../constants/chart";
import { countLabel } from "../../utils/analytics";
import { formatTaka } from "../../utils/money";
import StatPanel, { StatTile } from "./ui/StatPanel";

// What happened around the sales in the period: collected, due, returns, exchanges, discount, incentive.
// sales covers POS sales and exchanges together; due is what was left unpaid at billing.
const SalesDetailsPanel = ({ sales, exchanges, saleReturns, linkTo, periodLabel }) => (
  <StatPanel icon={LuShoppingCart} title="Sales details" hint={periodLabel}>
    <StatTile icon={LuWallet} tone={TILE_TINTS.teal} label="Collected" link={linkTo("sales")} value={formatTaka(sales.paid)} hint="Paid at billing" />
    <StatTile
      icon={LuHourglass}
      tone={TILE_TINTS.red}
      label="Sale Due"
      link={linkTo("sales")}
      value={formatTaka(sales.due)}
      valueClass={sales.due ? "text-red-600" : "text-slate-900"}
      hint="Unpaid at billing"
    />
    <StatTile
      icon={LuUndo2}
      tone={TILE_TINTS.amber}
      label="POS Returns"
      link={linkTo("posReturns")}
      value={formatTaka(saleReturns.total)}
      hint={`${countLabel(saleReturns.count, "return")} · refund ${formatTaka(saleReturns.refund)}`}
    />
    <StatTile
      icon={LuRepeat}
      tone={TILE_TINTS.purple}
      label="Exchanges"
      link={linkTo("exchanges")}
      value={formatTaka(exchanges.exchangeValue)}
      hint={`${countLabel(exchanges.count, "exchange")} · old devices in`}
    />
    <StatTile icon={LuTag} tone={TILE_TINTS.pink} label="Discount Given" link={linkTo("sales")} value={formatTaka(sales.discount)} />
    <StatTile
      icon={LuGift}
      tone={TILE_TINTS.amber}
      label="Staff Incentive"
      link={linkTo("sales")}
      value={formatTaka(sales.incentive)}
      hint={`Delivery ${formatTaka(sales.delivery)}`}
    />
  </StatPanel>
);

export default SalesDetailsPanel;
