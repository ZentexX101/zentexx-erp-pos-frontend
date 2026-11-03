import { LuArrowLeftRight, LuBoxes, LuCoins, LuPackage, LuPackageX, LuTriangleAlert } from "react-icons/lu";
import { TILE_TINTS } from "../../constants/chart";
import { countLabel } from "../../utils/analytics";
import { formatTaka } from "../../utils/money";
import StatPanel, { StatTile } from "./ui/StatPanel";

// Stock right now (units, value, low / out) and what moved between branches in the period.
// showMoney: the stock's cost (main admins); others see the product count in its place.
const StockPanel = ({ stock, transfers, productCount, linkTo, showMoney, periodLabel }) => {
  return (
    <StatPanel icon={LuBoxes} title="Stock" hint="Right now">
      <StatTile
        icon={LuBoxes}
        tone={TILE_TINTS.blue}
        label="Stock Units"
        link={linkTo("stock")}
        value={stock.units.toLocaleString("en-IN")}
        hint={countLabel(stock.rows, "product")}
      />
      {showMoney ? (
        <StatTile
          icon={LuCoins}
          tone={TILE_TINTS.amber}
          label="Stock Value"
          link={linkTo("stock")}
          value={formatTaka(stock.value)}
          hint={`Sells for ${formatTaka(stock.saleValue)}`}
        />
      ) : (
        <StatTile icon={LuPackage} tone={TILE_TINTS.purple} label="Products" link={linkTo("products")} value={productCount} />
      )}
      <StatTile icon={LuTriangleAlert} tone={TILE_TINTS.amber} label="Low Stock" link={linkTo("stock")} value={stock.lowStock} hint="1–5 pieces left" />
      <StatTile
        icon={LuPackageX}
        tone={TILE_TINTS.red}
        label="Out of Stock"
        link={linkTo("stock")}
        value={stock.outOfStock}
        valueClass={stock.outOfStock ? "text-red-600" : "text-slate-900"}
      />
      <StatTile
        icon={LuArrowLeftRight}
        tone={TILE_TINTS.slate}
        label="Transferred"
        link={linkTo("transfers")}
        value={`${transfers.units} pcs`}
        hint={`${countLabel(transfers.count, "transfer")} · ${periodLabel}`}
      />
    </StatPanel>
  );
};

export default StockPanel;
