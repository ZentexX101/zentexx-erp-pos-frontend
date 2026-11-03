import { LuBuilding2, LuListTree, LuPackage, LuTruck, LuUserRound, LuUsers } from "react-icons/lu";
import { TILE_TINTS } from "../../constants/chart";
import { countLabel } from "../../utils/analytics";
import { formatTaka } from "../../utils/money";
import StatPanel, { StatTile } from "./ui/StatPanel";

// Business-wide numbers (suppliers and customers are shared by every branch).
// Each tile opens its main-panel page (main admins).
const BusinessPanel = ({ dues, counts, linkTo }) => {
  return (
    <StatPanel icon={LuBuilding2} title="Business" hint="All branches">
      <StatTile
        icon={LuTruck}
        tone={TILE_TINTS.red}
        label="Supplier Due"
        link={linkTo("suppliers")}
        value={formatTaka(dues.supplier)}
        valueClass={dues.supplier ? "text-red-600" : "text-slate-900"}
        hint={`To ${countLabel(dues.supplierCount, "supplier")}`}
      />
      <StatTile
        icon={LuUserRound}
        tone={TILE_TINTS.amber}
        label="Customer Due"
        link={linkTo("customers")}
        value={formatTaka(dues.customer)}
        hint={`From ${countLabel(dues.customerCount, "customer")}`}
      />
      <StatTile
        icon={LuPackage}
        tone={TILE_TINTS.purple}
        label="Products"
        link={linkTo("products")}
        value={counts.products}
        hint={`${counts.categories} categories · ${counts.brands} brands`}
      />
      <StatTile
        icon={LuUsers}
        tone={TILE_TINTS.green}
        label="Customers"
        link={linkTo("customers")}
        value={counts.customers}
        hint={countLabel(counts.suppliers, "supplier")}
      />
      <StatTile icon={LuListTree} tone={TILE_TINTS.blue} label="Branches" link={linkTo("branches")} value={counts.branches} />
      <StatTile icon={LuUsers} tone={TILE_TINTS.pink} label="Staff" link={linkTo("staff")} value={counts.staff} />
    </StatPanel>
  );
};

export default BusinessPanel;
