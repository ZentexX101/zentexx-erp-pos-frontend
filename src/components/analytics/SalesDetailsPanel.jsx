import { LuConciergeBell, LuGift, LuHourglass, LuRepeat, LuShoppingCart, LuTag, LuTruck, LuWrench, LuUndo2, LuWallet } from "react-icons/lu";
import { TILE_TINTS } from "../../constants/chart";
import { countLabel } from "../../utils/analytics";
import { formatTaka } from "../../utils/money";
import { roundTaka } from "../../utils/number";
import StatPanel, { StatTile } from "./ui/StatPanel";

// What happened around the sales in the period: collected, due, returns, exchanges, services, discount,
// delivery and incentive. sales covers POS sales and exchanges together; due is what was left unpaid at billing.
// serviceSales: services sold for devices (coverage...); the incentive adds the sellers' share of those.
const SalesDetailsPanel = ({ sales, exchanges, saleReturns, serviceSales, repairs, linkTo, periodLabel }) => {
  const services = serviceSales ?? { count: 0, total: 0, due: 0, incentive: 0 };
  return (
    <StatPanel icon={LuShoppingCart} title="Sales details" hint={periodLabel}>
      <StatTile
        icon={LuWallet}
        tone={TILE_TINTS.teal}
        label="Collected"
        link={linkTo("sales")}
        value={formatTaka(sales.paid)}
        hint={sales.advance ? `Includes ${formatTaka(sales.advance)} pre order advance` : "Paid at billing"}
      />
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
      <StatTile
        icon={LuConciergeBell}
        tone={TILE_TINTS.blue}
        label="Service Sales"
        link={linkTo("serviceSales")}
        value={formatTaka(services.total)}
        hint={`${countLabel(services.count, "service")}${services.due ? ` · due ${formatTaka(services.due)}` : ""}`}
      />
      <StatTile
        icon={LuWrench}
        tone={TILE_TINTS.slate}
        label="Repairs"
        link={linkTo("repairs")}
        value={formatTaka(repairs?.total ?? 0)}
        hint={`${countLabel(repairs?.count ?? 0, "job")} closed · ${repairs?.open ?? 0} in the shop${repairs?.due ? ` · due ${formatTaka(repairs.due)}` : ""}`}
      />
      <StatTile
        icon={LuGift}
        tone={TILE_TINTS.amber}
        label="Staff Incentive"
        link={linkTo("sales")}
        value={formatTaka(roundTaka(sales.incentive + services.incentive))}
        hint={`Sales ${formatTaka(sales.incentive)} · services ${formatTaka(services.incentive)}`}
      />
      <StatTile icon={LuTag} tone={TILE_TINTS.pink} label="Discount Given" link={linkTo("sales")} value={formatTaka(sales.discount)} />
      <StatTile
        icon={LuTruck}
        tone={TILE_TINTS.slate}
        label="Delivery Charge"
        link={linkTo("sales")}
        value={formatTaka(sales.delivery)}
        hint="Charged to customers"
      />
    </StatPanel>
  );
};

export default SalesDetailsPanel;
