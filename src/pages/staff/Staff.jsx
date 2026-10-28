import { useCallback, useEffect, useMemo, useState } from "react";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import IconButton from "../../components/common/buttons/IconButton";
import Badge from "../../components/common/data/Badge";
import DataTable from "../../components/common/data/DataTable";
import SearchInput from "../../components/common/forms/SearchInput";
import Icon from "../../components/common/icons/Icon";
import PageHeader from "../../components/common/layout/PageHeader";
import ConfirmModal from "../../components/common/modals/ConfirmModal";
import PermissionsViewModal from "../../components/staff/PermissionsViewModal";
import StaffFormModal from "../../components/staff/StaffFormModal";
import { canManageUser, ROLE_LABELS, ROLES } from "../../constants/roles";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { branchService } from "../../services/branchService";
import { staffService } from "../../services/staffService";
import { formatShortDate } from "../../utils/formatDate";
import { formatPhone } from "../../utils/phone";

const ROLE_TONES = { [ROLES.SUPER_ADMIN]: "purple", [ROLES.ADMIN]: "blue", [ROLES.SUB_ADMIN]: "slate" };

const FILTER_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const formatTaka = (amount) => (amount === null || amount === undefined ? "—" : `৳${Number(amount).toLocaleString("en-IN")}`);

const Staff = () => {
  const { user: actor } = useAuth();

  const [staff, setStaff] = useState([]);
  const [branches, setBranches] = useState([]);
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [filters, setFilters] = useState({ branch: "", role: "", status: "" });

  // null = closed, { staff: null } = create, { staff } = edit
  const [form, setForm] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setStaff(await staffService.getStaff({ ...filters, search }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, search]);

  useEffect(() => {
    load();
  }, [load]);

  // Branches (for the filter, form and machine status) and the permission catalog load once
  useEffect(() => {
    Promise.all([branchService.getBranches(), staffService.getPermissionCatalog()])
      .then(([branchList, permissionCatalog]) => {
        setBranches(branchList);
        setCatalog(permissionCatalog);
      })
      .catch((err) => setError(err.message));
  }, []);

  const branchById = useMemo(() => Object.fromEntries(branches.map((b) => [b._id, b])), [branches]);

  const openForm = (target) => {
    setNotice("");
    setForm({ staff: target });
  };

  const handleSaved = (saved, isEdit) => {
    setForm(null);
    setNotice(isEdit ? `${saved.name} updated.` : `${saved.name} created (Staff ID #${saved.staffCode}). They can sign in now.`);
    load();
  };

  const handleDelete = async () => {
    await staffService.remove(deleting._id);
    setNotice(`${deleting.name} deleted.`);
    setDeleting(null);
    load();
  };

  const columns = [
    { key: "index", header: "#", className: "text-slate-500", render: (_, i) => i + 1 },
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
    { key: "designation", header: "Designation", className: "text-slate-600", render: (s) => s.designation || "—" },
    {
      key: "role",
      header: "Type",
      render: (s) => (
        <div className="flex flex-col items-start gap-1">
          <Badge tone={ROLE_TONES[s.role]}>{ROLE_LABELS[s.role] || s.role}</Badge>
          {s.isManager && <Badge tone="amber">Manager</Badge>}
        </div>
      ),
    },
    {
      key: "branch",
      header: "Branch",
      className: "whitespace-nowrap",
      render: (s) =>
        s.branch ? (
          <span className="text-slate-800">{s.branch.name}</span>
        ) : s.role === ROLES.SUB_ADMIN ? (
          <span className="font-medium text-red-600">Not assigned</span>
        ) : (
          <span className="text-slate-500">All branches</span>
        ),
    },
    {
      key: "machine",
      header: "Machine",
      render: (s) => {
        const configured = s.branch && branchById[s.branch._id]?.zkteco?.enabled;
        return <Badge tone={configured ? "blue" : "outline"}>{configured ? "Configured" : "Not Configured"}</Badge>;
      },
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
      render: (s) => <Badge tone={s.showDashboard ? "green" : "outline"}>{s.showDashboard ? "Allowed" : "Hidden"}</Badge>,
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
          {s.role === ROLES.SUB_ADMIN ? s.permissions.length : "Full"}
        </button>
      ),
    },
    { key: "createdAt", header: "Created", className: "whitespace-nowrap text-slate-600", render: (s) => formatShortDate(s.createdAt) },
    {
      key: "actions",
      header: "Action",
      headerClassName: "text-right",
      render: (s) =>
        canManageUser(actor, s) ? (
          <div className="flex justify-end gap-2">
            <IconButton icon="edit" label={`Edit ${s.name}`} onClick={() => openForm(s)} />
            <IconButton
              icon="trash"
              label={`Delete ${s.name}`}
              variant="danger"
              onClick={() => {
                setNotice("");
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

      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search name, phone, ID, designation..."
          className="lg:w-80"
        />
        <select
          value={filters.branch}
          onChange={(e) => setFilters((prev) => ({ ...prev, branch: e.target.value }))}
          aria-label="Filter by branch"
          className={FILTER_CLASS}
        >
          <option value="">All branches</option>
          <option value="none">Main admins (no branch)</option>
          {branches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          value={filters.role}
          onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
          aria-label="Filter by type"
          className={FILTER_CLASS}
        >
          <option value="">All types</option>
          {Object.values(ROLES).map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
          aria-label="Filter by status"
          className={FILTER_CLASS}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="mt-4 space-y-2">
        <Alert type="success">{notice}</Alert>
        <Alert>{error}</Alert>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} rows={staff} loading={loading} emptyMessage="No staff found." minWidth={1400} />
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
