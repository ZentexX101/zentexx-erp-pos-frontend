import { LuBookOpen } from "react-icons/lu";
import { Link } from "react-router";
import { customerLedgerPath } from "../../constants/routes";
import { CUSTOMER_STATUS } from "../../constants/customer";
import { formatShortDate } from "../../utils/formatDate";
import { rowNumber } from "../../utils/pagination";
import { formatPhone } from "../../utils/phone";
import IconButton from "../common/buttons/IconButton";
import Badge from "../common/data/Badge";
import DataTable from "../common/data/DataTable";
import Pagination from "../common/data/Pagination";
import CustomerBalance from "./CustomerBalance";

// Customer list with pagination. Red balance = the customer pays us, green = we pay the customer.
const CustomerTable = ({ customers, meta, isLoading, search, canEdit, canDelete, onEdit, onDelete, onPageChange, onLimitChange }) => {
  const columns = [
    { key: "index", header: "#", hideBelow: "sm", className: "text-slate-500", render: (_, i) => rowNumber(meta, i) },
    {
      key: "name",
      header: "Customer Name",
      // Below md the Phone column (and below sm the Balance column) are hidden, so they sit under the name
      render: (s) => (
        <div className="min-w-0">
          <p className="font-medium text-slate-900">{s.name}</p>
          <p className="whitespace-nowrap text-xs text-slate-500 md:hidden">{formatPhone(s.phone)}</p>
          <CustomerBalance amount={s.balance} signed className="mt-0.5 block text-sm sm:hidden" />
        </div>
      ),
    },
    { key: "phone", header: "Phone", hideBelow: "md", className: "whitespace-nowrap text-slate-700", render: (s) => formatPhone(s.phone) },
    { key: "address", header: "Address", hideBelow: "lg", className: "text-slate-600" },
    {
      key: "balance",
      header: "Balance",
      hideBelow: "sm",
      headerClassName: "text-right md:text-left",
      className: "whitespace-nowrap text-right md:text-left",
      render: (s) => <CustomerBalance amount={s.balance} signed />,
    },
    {
      key: "status",
      header: "Status",
      hideBelow: "md",
      render: (s) => (
        <Badge tone={s.status === CUSTOMER_STATUS.ACTIVE ? "green" : "slate"}>
          {s.status === CUSTOMER_STATUS.ACTIVE ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    { key: "createdAt", header: "Created Date", hideBelow: "xl", className: "whitespace-nowrap text-slate-600", render: (s) => formatShortDate(s.createdAt) },
  ];

  // Ledger is always there (this list already needs customer.view); edit / delete need their permission
  columns.push({
    key: "actions",
    header: "Action",
    headerClassName: "text-right",
    render: (s) => (
      <div className="flex items-center justify-end gap-1.5 sm:gap-2">
        {canEdit && <IconButton icon="edit" label={`Edit ${s.name}`} onClick={() => onEdit(s)} />}
        <Link
          to={customerLedgerPath(s._id)}
          aria-label={`Ledger of ${s.name}`}
          title="Ledger"
          className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 sm:px-2.5 sm:py-1"
        >
          <LuBookOpen className="size-4 sm:hidden" aria-hidden="true" />
          <span className="hidden sm:inline">Ledger</span>
        </Link>
        {canDelete && <IconButton icon="trash" label={`Delete ${s.name}`} variant="danger" onClick={() => onDelete(s)} />}
      </div>
    ),
  });

  return (
    <div>
      <DataTable
        columns={columns}
        rows={customers}
        loading={isLoading}
        minWidth={960}
        minWidthFrom="xl"
        emptyMessage={search ? `No customer matches "${search}".` : "No customers yet. Create your first customer."}
      />
      <Pagination meta={meta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    </div>
  );
};

export default CustomerTable;
