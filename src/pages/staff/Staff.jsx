import { useState } from "react";
import { useNavigate } from "react-router";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import IconButton from "../../components/common/buttons/IconButton";
import Badge from "../../components/common/data/Badge";
import DataTable from "../../components/common/data/DataTable";
import Pagination from "../../components/common/data/Pagination";
import FilterBar from "../../components/common/forms/FilterBar";
import SearchInput from "../../components/common/forms/SearchInput";
import Select from "../../components/common/forms/Select";
import Icon from "../../components/common/icons/Icon";
import PageHeader from "../../components/common/layout/PageHeader";
import ConfirmModal from "../../components/common/modals/ConfirmModal";
import StaffCards from "../../components/staff/StaffCards";
import PermissionsViewModal from "../../components/staff/PermissionsViewModal";
import StaffFormModal from "../../components/staff/StaffFormModal";
import { canManageUser, isBranchRole, ROLE_LABELS, ROLE_TONES, ROLES } from "../../constants/roles";
import { getHomePath } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { useBranchOptionsData } from "../../hooks/useBranchApi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useDeleteStaff, usePermissionCatalogData, useStaffData } from "../../hooks/useStaffApi";
import { formatShortDate } from "../../utils/formatDate";
import { rowNumber } from "../../utils/pagination";
import { formatPhone } from "../../utils/phone";

const NO_FILTERS = { branch: "", role: "", status: "" };

const formatTaka = (amount) => (amount === null || amount === undefined ? "—" : `৳${Number(amount).toLocaleString("en-IN")}`);

const Staff = () => {
  const { user: actor, loginAs } = useAuth();
  const navigate = useNavigate();

  // all states
  const [actionError, setActionError] = useState("");
  // id of the staff member being entered with "Login as"
  const [enteringId, setEnteringId] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [filters, setFilters] = useState(NO_FILTERS);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  // null = closed, { staff: null } = create, { staff } = edit
  const [form, setForm] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // call staff api (search, filters and paging run on the backend)
  const { data, isLoading, error: staffError } = useStaffData({ ...filters, search, page, limit });
  // Branches (for the filter, form and machine status) and the permission catalog
  const { data: branches = [], error: branchError } = useBranchOptionsData();
  const { data: catalog = null, error: catalogError } = usePermissionCatalogData();
  const deleteStaff = useDeleteStaff();

  const staff = data?.data ?? [];
  const meta = data?.meta;
  const error = actionError || (staffError || branchError || catalogError)?.message;

  const handleSearch = (value) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters(NO_FILTERS);
    setPage(1);
  };

  const handleLimitChange = (value) => {
    setLimit(value);
    setPage(1);
  };

  const openForm = (target) => {
    setActionError("");
    setForm({ staff: target });
  };

  const handleSaved = () => {
    setForm(null);
  };

  // Opens the app as this staff member; the banner on top brings the admin back
  const handleLoginAs = async (target) => {
    setActionError("");
    setEnteringId(target._id);
    try {
      const entered = await loginAs(target);
      navigate(getHomePath(entered), { replace: true });
    } catch (err) {
      setActionError(err.message);
      setEnteringId(null);
    }
  };

  const handleDelete = async () => {
    await deleteStaff.mutateAsync(deleting._id);
    setDeleting(null);
    // The page's last row is gone: go back a page
    if (staff.length === 1 && page > 1) setPage(page - 1);
  };

  const columns = [
    { key: "index", header: "#", className: "text-slate-500", render: (_, i) => rowNumber(meta, i) },
    {
      key: "staffCode",
      header: "Staff ID",
      render: (s) =>
        s.staffCode ? (
          <span className="rounded-md bg-blue-50 px-2 py-0.5 font-mono text-xs font-semibold text-blue-700">#{s.staffCode}</span>
        ) : (
          "—"
        ),
    },
    {
      key: "name",
      header: "Name",
      render: (s) => (
        <div className="min-w-40">
          <p className="font-medium text-slate-900">
            {s.name}
            {s._id === actor._id && <span className="ml-1.5 text-xs font-normal text-slate-400">(you)</span>}
          </p>
          {s.email && <p className="text-xs text-slate-500">{s.email}</p>}
        </div>
      ),
    },
    { key: "phone", header: "Phone", className: "whitespace-nowrap text-slate-700", render: (s) => formatPhone(s.phone) },
    {
      key: "role",
      header: "Role",
      render: (s) => (
        <Badge tone={ROLE_TONES[s.role] || "slate"} className="whitespace-nowrap">
          {ROLE_LABELS[s.role] || s.role}
        </Badge>
      ),
    },
    {
      key: "branch",
      header: "Branch",
      className: "whitespace-nowrap",
      render: (s) =>
        s.branch ? (
          <span className="text-slate-800">{s.branch.name}</span>
        ) : isBranchRole(s.role) ? (
          <span className="font-medium text-red-600">Not assigned</span>
        ) : (
          <span className="text-slate-500">All branches</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (s) => <Badge tone={s.isActive ? "green" : "slate"}>{s.isActive ? "Active" : "Inactive"}</Badge>,
    },
    { key: "salary", header: "Salary", className: "whitespace-nowrap font-medium text-slate-700", render: (s) => formatTaka(s.salary) },
    {
      key: "dashboard",
      header: "Dashboard",
      render: (s) => {
        const allowed = !isBranchRole(s.role) || s.permissions.includes("dashboard.view");
        return <Badge tone={allowed ? "green" : "outline"}>{allowed ? "Allowed" : "Hidden"}</Badge>;
      },
    },
    {
      key: "permissions",
      header: "Permissions",
      headerClassName: "text-center",
      className: "text-center",
      render: (s) => (
        <button
          type="button"
          onClick={() => setViewing(s)}
          className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
        >
          <Icon name="shield" className="h-3.5 w-3.5" />
          {isBranchRole(s.role) ? s.permissions.length : "Full"}
        </button>
      ),
    },
    { key: "createdAt", header: "Created", className: "whitespace-nowrap text-slate-600", render: (s) => formatShortDate(s.createdAt) },
    {
      key: "actions",
      header: "Action",
      sticky: "right",
      headerClassName: "text-right",
      render: (s) =>
        canManageUser(actor, s) ? (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => handleLoginAs(s)}
              disabled={!s.isActive || Boolean(enteringId)}
              title={s.isActive ? `Use the app as ${s.name}, without their password` : "Inactive staff can't be logged in as"}
              className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name="login" className="h-3.5 w-3.5" />
              {enteringId === s._id ? "Opening..." : "Login"}
            </button>
            <IconButton icon="edit" label={`Edit ${s.name}`} onClick={() => openForm(s)} />
            <IconButton
              icon="trash"
              label={`Delete ${s.name}`}
              variant="danger"
              onClick={() => {
                setDeleting(s);
              }}
            />
          </div>
        ) : (
          <p className="text-right text-xs text-slate-400">{s._id === actor._id ? "—" : "Owner only"}</p>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Staff"
        subtitle="Manage admins and branch staff"
        actions={
          <Button onClick={() => openForm(null)}>
            <Icon name="plus" />
            Create Staff
          </Button>
        }
      />

      <FilterBar
        className="mt-6"
        search={<SearchInput value={searchInput} onChange={handleSearch} placeholder="Search name, phone, ID, role..." />}
        onClear={Object.values(filters).some(Boolean) ? handleClearFilters : undefined}
      >
        <Select
          variant="filter"
          value={filters.branch}
          onChange={(e) => handleFilter("branch", e.target.value)}
          aria-label="Filter by branch"
          placeholder="All branches"
          options={branches.map((b) => ({ value: b._id, label: b.name }))}
        >
          <option value="none">Main admins (no branch)</option>
        </Select>
        <Select
          variant="filter"
          value={filters.role}
          onChange={(e) => handleFilter("role", e.target.value)}
          aria-label="Filter by role"
          placeholder="All roles"
          options={Object.values(ROLES).map((role) => ({ value: role, label: ROLE_LABELS[role] }))}
        />
        <Select
          variant="filter"
          value={filters.status}
          onChange={(e) => handleFilter("status", e.target.value)}
          aria-label="Filter by status"
          placeholder="All statuses"
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />
      </FilterBar>

      <div className="mt-4 space-y-2">
        <Alert>{error}</Alert>
      </div>

      <div className="mt-4">
        {/* Cards on phones, the table from sm */}
        <div className="sm:hidden">
          <StaffCards
            staff={staff}
            loading={isLoading}
            actor={actor}
            enteringId={enteringId}
            onLoginAs={handleLoginAs}
            onEdit={openForm}
            onDelete={setDeleting}
            onViewPermissions={setViewing}
          />
        </div>
        <div className="hidden sm:block">
          <DataTable columns={columns} rows={staff} loading={isLoading} emptyMessage="No staff found." minWidth={1400} />
        </div>
        <Pagination meta={meta} onPageChange={setPage} onLimitChange={handleLimitChange} />
      </div>

      {form && (
        <StaffFormModal
          staff={form.staff}
          branches={branches}
          catalog={catalog}
          onClose={() => setForm(null)}
          onSaved={handleSaved}
        />
      )}

      {viewing && <PermissionsViewModal staff={viewing} catalog={catalog} onClose={() => setViewing(null)} />}

      <ConfirmModal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete staff"
        confirmLabel="Delete"
        danger
        message={
          <>
            Delete <span className="font-medium text-slate-900">{deleting?.name}</span>? They'll be logged out and can't
            sign in again. To keep their records but block access, edit them and set the status to Inactive instead.
          </>
        }
      />
    </div>
  );
};

export default Staff;
