import { LuBuilding2, LuListTree, LuPackage, LuTruck, LuUserRound, LuUsers } from "react-icons/lu";
import { TILE_TINTS } from "../../constants/chart";
import { ROUTES } from "../../constants/routes";
import { countLabel } from "../../utils/analytics";
import { formatTaka } from "../../utils/money";
import StatPanel, { StatTile } from "./ui/StatPanel";

// Business-wide numbers (suppliers and customers are shared by every branch).
// Links go to main-panel pages, so they only show outside a branch.
const BusinessPanel = ({ dues, counts, inBranch }) => {
  const main = (route) => (inBranch ? undefined : route);
  return (
    <StatPanel icon={LuBuilding2} title="Business" hint="All branches">
      <StatTile
        icon={LuTruck}
        tone={TILE_TINTS.red}
        label="Supplier Due"
        value={formatTaka(dues.supplier)}
        valueClass={dues.supplier ? "text-red-600" : "text-slate-900"}
        hint={`To ${countLabel(dues.supplierCount, "supplier")}`}
        to={main(ROUTES.SUPPLIERS)}
      />
      <StatTile
        icon={LuUserRound}
        tone={TILE_TINTS.amber}
        label="Customer Due"
        value={formatTaka(dues.customer)}
        hint={`From ${countLabel(dues.customerCount, "customer")}`}
        to={main(ROUTES.CUSTOMERS)}
      />
      <StatTile
        icon={LuPackage}
        tone={TILE_TINTS.purple}
        label="Products"
        value={counts.products}
        hint={`${counts.categories} categories · ${counts.brands} brands`}
        to={main(ROUTES.PRODUCTS)}
      />
      <StatTile icon={LuUsers} tone={TILE_TINTS.green} label="Customers" value={counts.customers} hint={countLabel(counts.suppliers, "supplier")} to={main(ROUTES.CUSTOMERS)} />
      <StatTile icon={LuListTree} tone={TILE_TINTS.blue} label="Branches" value={counts.branches} to={main(ROUTES.BRANCHES)} />
      <StatTile icon={LuUsers} tone={TILE_TINTS.pink} label="Staff" value={counts.staff} to={main(ROUTES.STAFF)} />
    </StatPanel>
  );
};

export default BusinessPanel;
