import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import BranchFormModal from "../../components/branch/BranchFormModal";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import IconButton from "../../components/common/buttons/IconButton";
import Badge from "../../components/common/data/Badge";
import DataTable from "../../components/common/data/DataTable";
import SearchInput from "../../components/common/forms/SearchInput";
import Icon from "../../components/common/icons/Icon";
import PageHeader from "../../components/common/layout/PageHeader";
import ConfirmModal from "../../components/common/modals/ConfirmModal";
import { BRANCH_STATUS } from "../../constants/branch";
import { ROUTES } from "../../constants/routes";
import { useBranch } from "../../hooks/useBranch";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { branchService } from "../../services/branchService";
import { formatShortDate } from "../../utils/formatDate";

const Branches = () => {
  const navigate = useNavigate();
  const { enterBranch } = useBranch();

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());

  // null = closed, { branch: null } = create, { branch } = edit
  const [form, setForm] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setBranches(await branchService.getBranches({ search }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const openForm = (branch) => {
    setNotice("");
    setForm({ branch });
  };

  const handleSaved = (saved, isEdit) => {
    setForm(null);
    setNotice(isEdit ? `"${saved.name}" updated.` : `"${saved.name}" created.`);
    load();
  };

  const handleLogin = (branch) => {
    enterBranch(branch);
    navigate(ROUTES.BRANCH_HOME);
  };

  const handleDelete = async () => {
    await branchService.remove(deleting._id);
    setNotice(`"${deleting.name}" deleted.`);
    setDeleting(null);
    load();
  };

  const columns = [
    { key: "index", header: "#", className: "text-slate-500", render: (_, i) => i + 1 },
    { key: "name", header: "Branch Name", className: "font-medium text-slate-900" },
    { key: "address", header: "Address", className: "text-slate-600" },
    { key: "phone", header: "Phone", className: "whitespace-nowrap text-slate-700" },
    {
      key: "status",
      header: "Status",
      render: (b) => (
        <Badge tone={b.status === BRANCH_STATUS.ACTIVE ? "green" : "slate"}>
          {b.status === BRANCH_STATUS.ACTIVE ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "terminal",
      header: "ZKTeco Terminal",
      render: (b) =>
        b.zkteco?.enabled ? (
          <span className="font-mono text-xs text-slate-700">
            {b.zkteco.ip}:{b.zkteco.port}
          </span>
        ) : (
          <span className="italic text-slate-400">Not configured</span>
        ),
    },
    {
      key: "connection",
      header: "Connection",
      render: (b) => (
        <Badge tone={b.zkteco?.enabled ? "blue" : "outline"}>{b.zkteco?.enabled ? "Configured" : "Not Configured"}</Badge>
      ),
    },
    { key: "createdAt", header: "Created Date", className: "whitespace-nowrap text-slate-600", render: (b) => formatShortDate(b.createdAt) },
    {
      key: "actions",
      header: "Action",
      headerClassName: "text-right",
      render: (b) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => handleLogin(b)}
            className="inline-flex items-center gap-1.5 rounded-md bg-green-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-800"
          >
            <Icon name="login" className="h-3.5 w-3.5" />
            Login
          </button>
          <IconButton icon="edit" label={`Edit ${b.name}`} onClick={() => openForm(b)} />
          <IconButton
            icon="trash"
            label={`Delete ${b.name}`}
            variant="danger"
            onClick={() => {
              setNotice("");
              setDeleting(b);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Branch"
        subtitle="Manage all branches"
        actions={
          <Button onClick={() => openForm(null)}>
            <Icon name="plus" />
            Create Branch
          </Button>
        }
      />

      <SearchInput value={searchInput} onChange={setSearchInput} placeholder="Search branch..." className="mt-6 max-w-sm" />

      <div className="mt-4 space-y-2">
        <Alert type="success">{notice}</Alert>
        <Alert>{error}</Alert>
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={branches}
          loading={loading}
          minWidth={960}
          emptyMessage={search ? `No branch matches "${search}".` : "No branches yet. Create your first branch."}
        />
      </div>

      {form && <BranchFormModal branch={form.branch} onClose={() => setForm(null)} onSaved={handleSaved} />}

      <ConfirmModal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete branch"
        confirmLabel="Delete"
        danger
        message={
          <>
            Delete <span className="font-medium text-slate-900">{deleting?.name}</span>? This can't be undone. A branch that
            still has staff can't be deleted; set it to inactive instead.
          </>
        }
      />
    </div>
  );
};

export default Branches;
