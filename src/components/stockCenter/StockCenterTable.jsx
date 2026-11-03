import { formatTaka } from "../../utils/money";
import { rowNumber } from "../../utils/pagination";
import Badge from "../common/data/Badge";
import DataTable from "../common/data/DataTable";
import Pagination from "../common/data/Pagination";

const LOW_STOCK = 5;

const money = { headerClassName: "text-right", className: "text-right whitespace-nowrap" };

// A branch's pieces of one product: grey dash when it has none, amber when low
const BranchQuantity = ({ value }) => {
  if (!value) return <span className="text-slate-300">—</span>;
  return <span className={`font-semibold tabular-nums ${value <= LOW_STOCK ? "text-amber-600" : "text-slate-800"}`}>{value}</span>;
};

const Status = ({ quantity }) =>
  quantity === 0 ? <Badge tone="red">Out</Badge> : quantity <= LOW_STOCK ? <Badge tone="amber">Low</Badge> : <Badge tone="green">In stock</Badge>;

// Counts (branch columns, total) are centred, money right-aligned, each header lined up with its values.
// Every product with a column per branch (how many pieces each has), the total, and its cost / selling value.
// branches: the branch columns to show (all, or the one picked). showValue: costs (main admins).
const StockCenterTable = ({ rows, branches, meta, isLoading, hasFilters, showValue, onPageChange, onLimitChange }) => {
  const columns = [
    { key: "index", header: "#", className: "text-slate-500", render: (_, i) => rowNumber(meta, i) },
    {
      key: "product",
      header: "Product",
      className: "min-w-64",
      render: (r) => (
        <>
          <span className="block font-medium uppercase text-slate-900">
            {r.product?.name ?? "—"}
            {r.product?.trackSerial && (
              <Badge tone="purple" className="ml-2 normal-case">
                IMEI
              </Badge>
            )}
          </span>
          <span className="block text-xs text-slate-500">{[r.product?.category?.name, r.product?.brand?.name].filter(Boolean).join(" · ") || "—"}</span>
        </>
      ),
    },
    // One column per branch
    ...branches.map((b) => ({
      key: `branch-${b._id}`,
      header: (
        <span className="inline-block max-w-28 truncate align-bottom" title={b.name}>
          {b.name}
        </span>
      ),
      headerClassName: "text-center",
      className: "text-center",
      render: (r) => <BranchQuantity value={r.branches[b._id]} />,
    })),
    {
      key: "quantity",
      header: "Total",
      headerClassName: "text-center",
      className: "text-center",
      render: (r) => <span className="text-base font-bold tabular-nums text-slate-900">{r.quantity}</span>,
    },
    ...(showValue
      ? [
          { key: "value", header: "Cost Value", ...money, render: (r) => <span className="font-semibold">{formatTaka(r.value)}</span> },
          { key: "saleValue", header: "Selling Value", ...money, render: (r) => <span className="text-slate-600">{formatTaka(r.saleValue)}</span> },
        ]
      : []),
    { key: "status", header: "Status", headerClassName: "text-center", className: "text-center", render: (r) => <Status quantity={r.quantity} /> },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        rows={rows}
        rowKey="key"
        loading={isLoading}
        minWidth={760 + branches.length * 110}
        emptyMessage={hasFilters ? "No product matches these filters." : "No stock yet. Stock appears here once branches buy products."}
      />
      <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    </div>
  );
};

export default StockCenterTable;
