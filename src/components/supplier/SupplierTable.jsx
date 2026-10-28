import { Link } from "react-router";
import { supplierLedgerPath } from "../../constants/routes";
import { SUPPLIER_STATUS } from "../../constants/supplier";
import { formatShortDate } from "../../utils/formatDate";
import { rowNumber } from "../../utils/pagination";
import { formatPhone } from "../../utils/phone";
import IconButton from "../common/buttons/IconButton";
import Badge from "../common/data/Badge";
import DataTable from "../common/data/DataTable";
import Pagination from "../common/data/Pagination";
import SupplierBalance from "./SupplierBalance";

// Supplier list with pagination. Green balance = we pay the supplier, red = the supplier pays us.
const SupplierTable = ({ suppliers, meta, isLoading, search, canEdit, canDelete, onEdit, onDelete, onPageChange, onLimitChange }) => {
  const columns = [
    { key: "index", header: "#", className: "text-slate-500", render: (_, i) => rowNumber(meta, i) },
    { key: "name", header: "Supplier Name", className: "font-medium text-slate-900" },
    { key: "phone", header: "Phone", className: "whitespace-nowrap text-slate-700", render: (s) => formatPhone(s.phone) },
    { key: "address", header: "Address", className: "text-slate-600" },
    { key: "balance", header: "Balance", render: (s) => <SupplierBalance amount={s.balance} signed /> },
    {
      key: "status",
      header: "Status",
      render: (s) => (
        <Badge tone={s.status === SUPPLIER_STATUS.ACTIVE ? "green" : "slate"}>
          {s.status === SUPPLIER_STATUS.ACTIVE ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    { key: "createdAt", header: "Created Date", className: "whitespace-nowrap text-slate-600", render: (s) => formatShortDate(s.createdAt) },
  ];

  // Ledger is always there (this list already needs supplier.view); edit / delete need their permission
  columns.push({
    key: "actions",
    header: "Action",
    headerClassName: "text-right",
    render: (s) => (
      <div className="flex justify-end gap-2">
        {canEdit && <IconButton icon="edit" label={`Edit ${s.name}`} onClick={() => onEdit(s)} />}
        <Link
          to={supplierLedgerPath(s._id)}
          className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          Ledger
        </Link>
        {canDelete && <IconButton icon="trash" label={`Delete ${s.name}`} variant="danger" onClick={() => onDelete(s)} />}
      </div>
    ),
  });

  return (
    <div>
      <DataTable
        columns={columns}
        rows={suppliers}
        loading={isLoading}
        minWidth={960}
        emptyMessage={search ? `No supplier matches "${search}".` : "No suppliers yet. Create your first supplier."}
      />
      <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    </div>
  );
};

export default SupplierTable;
