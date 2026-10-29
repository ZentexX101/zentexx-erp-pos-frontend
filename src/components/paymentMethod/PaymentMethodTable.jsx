import { Link } from "react-router";
import { paymentMethodStatementPath } from "../../constants/routes";
import { PAYMENT_METHOD_STATUS } from "../../constants/paymentMethod";
import { formatShortDate } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";
import { rowNumber } from "../../utils/pagination";
import IconButton from "../common/buttons/IconButton";
import Badge from "../common/data/Badge";
import DataTable from "../common/data/DataTable";
import Pagination from "../common/data/Pagination";

const actionClass =
  "inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100";

// Payment method list with pagination. In / Out need payment_method.transaction; edit / delete their own permission.
const PaymentMethodTable = ({
  paymentMethods,
  meta,
  isLoading,
  search,
  canTransact,
  canEdit,
  canDelete,
  onTransaction,
  onEdit,
  onDelete,
  onPageChange,
  onLimitChange,
}) => {
  const columns = [
    { key: "index", header: "#", className: "text-slate-500", render: (_, i) => rowNumber(meta, i) },
    {
      key: "name",
      header: "Payment Method Name",
      render: (m) => (
        <span className="flex items-center gap-2 font-medium text-slate-900">
          {m.name}
          {m.isDefault && <Badge tone="blue">Default</Badge>}
        </span>
      ),
    },
    { key: "description", header: "Description", className: "max-w-72 text-slate-600", render: (m) => m.description || "—" },
    {
      key: "balance",
      header: "Current Balance",
      headerClassName: "text-right",
      className: "text-right whitespace-nowrap",
      render: (m) => <span className="font-semibold text-green-600">{formatTaka(m.balance)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (m) => (
        <Badge tone={m.status === PAYMENT_METHOD_STATUS.ACTIVE ? "green" : "slate"}>
          {m.status === PAYMENT_METHOD_STATUS.ACTIVE ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    { key: "createdAt", header: "Created Date", className: "whitespace-nowrap text-slate-600", render: (m) => formatShortDate(m.createdAt) },
    {
      key: "actions",
      header: "Action",
      headerClassName: "text-right",
      render: (m) => (
        <div className="flex justify-end gap-2">
          {canTransact && (
            <>
              <button type="button" onClick={() => onTransaction(m, "in")} className={`${actionClass} text-green-700`}>
                In
              </button>
              <button type="button" onClick={() => onTransaction(m, "out")} className={`${actionClass} text-red-600`}>
                Out
              </button>
            </>
          )}
          <Link to={paymentMethodStatementPath(m._id)} className={actionClass}>
            Statement
          </Link>
          {canEdit && <IconButton icon="edit" label={`Edit ${m.name}`} onClick={() => onEdit(m)} />}
          {canDelete && <IconButton icon="trash" label={`Delete ${m.name}`} variant="danger" onClick={() => onDelete(m)} />}
        </div>
      ),
    },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        rows={paymentMethods}
        loading={isLoading}
        minWidth={1050}
        emptyMessage={search ? `No payment method matches "${search}".` : "No payment methods yet. Create your first one, e.g. Cash."}
      />
      <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    </div>
  );
};

export default PaymentMethodTable;
