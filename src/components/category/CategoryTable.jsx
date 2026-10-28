import { CATEGORY_STATUS } from "../../constants/category";
import { formatShortDate } from "../../utils/formatDate";
import { rowNumber } from "../../utils/pagination";
import IconButton from "../common/buttons/IconButton";
import Badge from "../common/data/Badge";
import DataTable from "../common/data/DataTable";
import Pagination from "../common/data/Pagination";

// Category list with pagination. The Action column shows only for users who can edit or delete.
const CategoryTable = ({
  categories,
  meta,
  isLoading,
  search,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onPageChange,
  onLimitChange,
}) => {
  const columns = [
    { key: "index", header: "#", className: "text-slate-500", render: (_, i) => rowNumber(meta, i) },
    { key: "name", header: "Category Name", className: "font-medium text-slate-900" },
    {
      key: "incentiveAmount",
      header: "Incentive (৳)",
      render: (c) => <Badge tone="outline">৳{c.incentiveAmount}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      render: (c) => (
        <Badge tone={c.status === CATEGORY_STATUS.ACTIVE ? "green" : "slate"}>
          {c.status === CATEGORY_STATUS.ACTIVE ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    { key: "createdAt", header: "Created Date", className: "whitespace-nowrap text-slate-600", render: (c) => formatShortDate(c.createdAt) },
  ];

  if (canEdit || canDelete) {
    columns.push({
      key: "actions",
      header: "Action",
      headerClassName: "text-right",
      render: (c) => (
        <div className="flex justify-end gap-2">
          {canEdit && <IconButton icon="edit" label={`Edit ${c.name}`} onClick={() => onEdit(c)} />}
          {canDelete && <IconButton icon="trash" label={`Delete ${c.name}`} variant="danger" onClick={() => onDelete(c)} />}
        </div>
      ),
    });
  }

  return (
    <div>
      <DataTable
        columns={columns}
        rows={categories}
        loading={isLoading}
        minWidth={720}
        emptyMessage={search ? `No category matches "${search}".` : "No categories yet. Create your first category."}
      />
      <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    </div>
  );
};

export default CategoryTable;
