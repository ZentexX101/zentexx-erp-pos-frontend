import { LuScanLine } from "react-icons/lu";
import { formatShortDate } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { rowNumber } from "../../utils/pagination";
import IconButton from "../common/buttons/IconButton";
import Badge from "../common/data/Badge";
import DataTable from "../common/data/DataTable";
import Pagination from "../common/data/Pagination";

const LOW_STOCK = 5;

const money = { headerClassName: "text-right", className: "text-right whitespace-nowrap" };

// Quantity with a colour: red = out, amber = low
const Quantity = ({ value }) => {
  const tone = value === 0 ? "text-red-600" : value <= LOW_STOCK ? "text-amber-600" : "text-slate-900";
  return <span className={`font-semibold ${tone}`}>{value}</span>;
};

// The branch's stock. IMEI products open their IMEI list; canEdit shows the price button.
const StockTable = ({ rows, meta, isLoading, hasFilters, canEdit, onSerials, onEdit, onPageChange, onLimitChange }) => {
  const columns = [
    { key: "index", header: "#", className: "text-slate-500", render: (_, i) => rowNumber(meta, i) },
    {
      key: "name",
      header: "Product Name",
      className: "min-w-64",
      render: (s) => (
        <span className="font-medium uppercase text-slate-900">
          {s.product?.name}
          {s.product?.trackSerial && <Badge tone="purple" className="ml-2 normal-case">IMEI</Badge>}
        </span>
      ),
    },
    { key: "category", header: "Category", className: "text-slate-700", render: (s) => s.product?.category?.name ?? "—" },
    { key: "brand", header: "Brand", className: "uppercase text-slate-700", render: (s) => s.product?.brand?.name ?? "—" },
    { key: "quantity", header: "Quantity", ...money, render: (s) => <Quantity value={s.quantity} /> },
    { key: "purchasePrice", header: "Buying Price", ...money, render: (s) => formatTaka(s.purchasePrice) },
    {
      key: "value",
      header: "Total Value",
      ...money,
      render: (s) => <span className="font-semibold">{formatTaka(s.quantity * s.purchasePrice)}</span>,
    },
    { key: "salePrice", header: "Selling Price", ...money, render: (s) => formatTaka(s.salePrice) },
    {
      key: "serials",
      header: "IMEI Serials",
      headerClassName: "text-center",
      className: "text-center",
      render: (s) =>
        s.product?.trackSerial ? (
          <button
            type="button"
            onClick={() => onSerials(s)}
            className="inline-flex rounded-md border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-100"
            aria-label={`IMEI list of ${s.product.name}`}
            title="IMEI list"
          >
            <LuScanLine className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    { key: "createdAt", header: "Created Date", className: "whitespace-nowrap text-slate-600", render: (s) => formatShortDate(s.createdAt) },
  ];

  if (canEdit) {
    columns.push({
      key: "actions",
      header: "Action",
      headerClassName: "text-right",
      render: (s) => (
        <div className="flex justify-end">
          <IconButton icon="edit" label={`Update prices of ${s.product?.name}`} onClick={() => onEdit(s)} />
        </div>
      ),
    });
  }

  return (
    <div>
      <DataTable
        columns={columns}
        rows={rows}
        loading={isLoading}
        minWidth={1200}
        emptyMessage={hasFilters ? "No stock matches these filters." : "No stock yet. Purchase products, or use Sync Products to list them all."}
      />
      <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    </div>
  );
};

export default StockTable;
