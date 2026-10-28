import { PRODUCT_STATUS } from "../../constants/product";
import { formatShortDate } from "../../utils/formatDate";
import { rowNumber } from "../../utils/pagination";
import IconButton from "../common/buttons/IconButton";
import Badge from "../common/data/Badge";
import DataTable from "../common/data/DataTable";
import Pagination from "../common/data/Pagination";

const ProductImage = ({ product }) =>
  product.image ? (
    <img src={product.image.url} alt={product.name} className="h-11 w-11 rounded-md object-cover ring-1 ring-slate-200" />
  ) : (
    <span className="flex h-11 w-11 items-center justify-center rounded-md bg-slate-50 text-center text-[10px] leading-tight text-slate-400 ring-1 ring-slate-200">
      No
      <br />
      Image
    </span>
  );

// Product list with pagination. The Action column shows only for users who can edit or delete.
const ProductTable = ({ products, meta, isLoading, hasFilters, canEdit, canDelete, onEdit, onDelete, onPageChange, onLimitChange }) => {
  const columns = [
    { key: "index", header: "#", className: "text-slate-500", render: (_, i) => rowNumber(meta, i) },
    { key: "image", header: "Image", render: (p) => <ProductImage product={p} /> },
    { key: "name", header: "Name", className: "min-w-56 font-medium text-slate-900" },
    { key: "category", header: "Category", className: "text-slate-600", render: (p) => p.category?.name ?? "—" },
    { key: "brand", header: "Brand", className: "text-slate-600", render: (p) => p.brand?.name ?? "—" },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <Badge tone={p.status === PRODUCT_STATUS.ACTIVE ? "green" : "slate"}>
          {p.status === PRODUCT_STATUS.ACTIVE ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    { key: "createdAt", header: "Created", className: "whitespace-nowrap text-slate-600", render: (p) => formatShortDate(p.createdAt) },
  ];

  if (canEdit || canDelete) {
    columns.push({
      key: "actions",
      header: "Action",
      headerClassName: "text-right",
      render: (p) => (
        <div className="flex justify-end gap-2">
          {canEdit && <IconButton icon="edit" label={`Edit ${p.name}`} onClick={() => onEdit(p)} />}
          {canDelete && <IconButton icon="trash" label={`Delete ${p.name}`} variant="danger" onClick={() => onDelete(p)} />}
        </div>
      ),
    });
  }

  return (
    <div>
      <DataTable
        columns={columns}
        rows={products}
        loading={isLoading}
        minWidth={960}
        emptyMessage={hasFilters ? "No product matches these filters." : "No products yet. Create your first product."}
      />
      <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    </div>
  );
};

export default ProductTable;
