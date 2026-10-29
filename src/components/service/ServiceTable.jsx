import { SERVICE_STATUS } from "../../constants/service";
import { formatShortDate } from "../../utils/formatDate";
import { rowNumber } from "../../utils/pagination";
import IconButton from "../common/buttons/IconButton";
import Badge from "../common/data/Badge";
import DataTable from "../common/data/DataTable";
import Pagination from "../common/data/Pagination";

const formatPercent = (value) => `${Number(value) || 0}%`;

// Service list with pagination. The Action column shows only for users who can edit or delete.
const ServiceTable = ({ services, meta, isLoading, search, canEdit, canDelete, onEdit, onDelete, onPageChange, onLimitChange }) => {
  const columns = [
    { key: "index", header: "#", className: "text-slate-500", render: (_, i) => rowNumber(meta, i) },
    // Service names are long, so this column wraps instead of stretching the table
    { key: "name", header: "Service Name", className: "min-w-72 font-medium text-slate-900" },
    {
      key: "pricePercent",
      header: "Price (%)",
      headerClassName: "text-right",
      className: "text-right whitespace-nowrap font-medium text-slate-900",
      render: (s) => formatPercent(s.pricePercent),
    },
    {
      key: "incentivePercent",
      header: "Incentive (%)",
      headerClassName: "text-right",
      className: "text-right whitespace-nowrap text-slate-700",
      render: (s) => formatPercent(s.incentivePercent),
    },
    {
      key: "status",
      header: "Status",
      render: (s) => (
        <Badge tone={s.status === SERVICE_STATUS.ACTIVE ? "green" : "slate"}>
          {s.status === SERVICE_STATUS.ACTIVE ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    { key: "createdAt", header: "Created Date", className: "whitespace-nowrap text-slate-600", render: (s) => formatShortDate(s.createdAt) },
  ];

  if (canEdit || canDelete) {
    columns.push({
      key: "actions",
      header: "Action",
      headerClassName: "text-right",
      render: (s) => (
        <div className="flex justify-end gap-2">
          {canEdit && <IconButton icon="edit" label={`Edit ${s.name}`} onClick={() => onEdit(s)} />}
          {canDelete && <IconButton icon="trash" label={`Delete ${s.name}`} variant="danger" onClick={() => onDelete(s)} />}
        </div>
      ),
    });
  }

  return (
    <div>
      <DataTable
        columns={columns}
        rows={services}
        loading={isLoading}
        minWidth={900}
        emptyMessage={search ? `No service matches "${search}".` : "No services yet. Create your first service."}
      />
      <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    </div>
  );
};

export default ServiceTable;
