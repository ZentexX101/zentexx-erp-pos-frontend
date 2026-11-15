import { UNIT_STATUS_INFO } from "../../constants/product";
import { conditionText } from "../../utils/exchange";
import { formatDate } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { rowNumber } from "../../utils/pagination";
import Badge from "../common/data/Badge";
import DataTable from "../common/data/DataTable";
import Pagination from "../common/data/Pagination";

// Where the piece came from: a purchase invoice, or a customer's old device taken in an exchange
const Source = ({ unit }) => {
  const doc = unit.purchase ?? unit.tradeIn;
  return (
    <>
      <span className="block font-medium text-slate-800">
        {unit.purchase ? (unit.supplier?.name ?? "—") : "Exchange trade-in"}
        {unit.tradeIn?.source && (
          <span className="ml-1 text-xs font-normal text-slate-500">({unit.tradeIn.source.kind === "ours" ? "sold by us earlier" : "outside device"})</span>
        )}
      </span>
      {doc && (
        <span className="block whitespace-nowrap text-xs text-slate-500">
          {doc.invoiceNo} · {formatDate(doc.date)}
        </span>
      )}
      {conditionText(unit.tradeIn?.condition) && <span className="block text-xs text-slate-500">{conditionText(unit.tradeIn.condition)}</span>}
    </>
  );
};

// The sale that took a sold piece out
const SaleInfo = ({ unit }) => {
  if (!unit.sale) return <span className="text-slate-400">—</span>;
  return (
    <>
      <span className="block font-medium text-slate-800">{unit.sale.invoiceNo}</span>
      <span className="block whitespace-nowrap text-xs text-slate-500">
        {formatDate(unit.sale.date)} · {unit.sale.customer?.name ?? "Walk-in"}
      </span>
    </>
  );
};

// One row per IMEI piece, newest first
const ProductUnitTable = ({ units, meta, isLoading, hasFilters, onPageChange, onLimitChange }) => {
  const columns = [
    { key: "index", header: "#", className: "text-slate-500", render: (_, i) => rowNumber(meta, i) },
    {
      key: "serial",
      header: "IMEI / Serial",
      render: (u) => <span className="whitespace-nowrap font-mono font-medium text-slate-900">{u.serial}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (u) => {
        const info = UNIT_STATUS_INFO[u.status] ?? { label: u.status, tone: "slate" };
        return (
          <Badge tone={info.tone} dot className="whitespace-nowrap">
            {info.label}
          </Badge>
        );
      },
    },
    { key: "branch", header: "Branch", className: "whitespace-nowrap text-slate-700", render: (u) => u.branch?.name ?? "—" },
    { key: "source", header: "Came from", className: "min-w-44", render: (u) => <Source unit={u} /> },
    {
      key: "price",
      header: "Buying / Selling",
      className: "whitespace-nowrap tabular-nums",
      render: (u) => (
        <>
          <span className="block text-slate-800">{formatTaka(u.purchasePrice)}</span>
          <span className="block text-xs text-slate-500">{u.salePrice ? formatTaka(u.salePrice) : "—"}</span>
        </>
      ),
    },
    { key: "sale", header: "Sold in", className: "min-w-40", render: (u) => <SaleInfo unit={u} /> },
    { key: "createdAt", header: "Stocked", className: "whitespace-nowrap text-slate-600", render: (u) => formatDate(u.createdAt) },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        rows={units}
        loading={isLoading}
        minWidth={1000}
        emptyMessage={hasFilters ? "No IMEI matches these filters." : "No IMEIs yet. They're added when this product is purchased."}
      />
      <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    </div>
  );
};

export default ProductUnitTable;
