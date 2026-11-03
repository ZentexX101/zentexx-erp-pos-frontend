import { LuPackageX } from "react-icons/lu";
import { ROUTES } from "../../constants/routes";
import Badge from "../common/data/Badge";
import ChartCard from "./ui/ChartCard";
import MiniTable from "./ui/MiniTable";
import ViewAllLink from "./ui/ViewAllLink";

// Products that ran out or are about to (5 pieces or fewer). showBranch: the all-branch view adds the branch.
const LowStockCard = ({ rows, inBranch, showBranch }) => {
  const columns = [
    { key: "product", header: "Product", render: (row) => <span className="font-medium uppercase text-slate-900">{row.product?.name ?? "—"}</span> },
    ...(showBranch ? [{ key: "branch", header: "Branch", className: "text-slate-600", render: (row) => row.branch?.name ?? "—" }] : []),
    {
      key: "quantity",
      header: "Left",
      className: "text-right",
      render: (row) => <Badge tone={row.quantity === 0 ? "red" : "amber"}>{row.quantity === 0 ? "Out" : `${row.quantity} left`}</Badge>,
    },
  ];

  return (
    <ChartCard icon={LuPackageX} title="Low & Out of Stock" subtitle="5 pieces or fewer" action={<ViewAllLink to={inBranch && ROUTES.BRANCH_STOCK} />}>
      <MiniTable rows={rows} columns={columns} emptyText="Everything is well stocked." />
    </ChartCard>
  );
};

export default LowStockCard;
