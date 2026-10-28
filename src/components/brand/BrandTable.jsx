import { BRAND_STATUS } from "../../constants/brand";
import { formatShortDate } from "../../utils/formatDate";
import { rowNumber } from "../../utils/pagination";
import IconButton from "../common/buttons/IconButton";
import Badge from "../common/data/Badge";
import DataTable from "../common/data/DataTable";
import Pagination from "../common/data/Pagination";

// Brand list with pagination. The Action column shows only for users who can edit or delete.
const BrandTable = ({ brands, meta, isLoading, search, canEdit, canDelete, onEdit, onDelete, onPageChange, onLimitChange }) => {
  const columns = [
    { key: "index", header: "#", className: "text-slate-500", render: (_, i) => rowNumber(meta, i) },
    { key: "name", header: "Brand Name", className: "font-medium text-slate-900" },
    {
      key: "status",
      header: "Status",
      render: (b) => (
        <Badge tone={b.status === BRAND_STATUS.ACTIVE ? "green" : "slate"}>
          {b.status === BRAND_STATUS.ACTIVE ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    { key: "createdAt", header: "Created Date", className: "whitespace-nowrap text-slate-600", render: (b) => formatShortDate(b.createdAt) },
  ];

  if (canEdit || canDelete) {
    columns.push({
      key: "actions",
      header: "Action",
      headerClassName: "text-right",
      render: (b) => (
        <div className="flex justify-end gap-2">
          {canEdit && <IconButton icon="edit" label={`Edit ${b.name}`} onClick={() => onEdit(b)} />}
          {canDelete && <IconButton icon="trash" label={`Delete ${b.name}`} variant="danger" onClick={() => onDelete(b)} />}
        </div>
      ),
    });
  }

  return (
    <div>
      <DataTable
        columns={columns}
        rows={brands}
        loading={isLoading}
        minWidth={640}
        emptyMessage={search ? `No brand matches "${search}".` : "No brands yet. Create your first brand."}
      />
      <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    </div>
  );
};

export default BrandTable;
