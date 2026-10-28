import { useState } from "react";
import { useNavigate } from "react-router";
import BranchFormModal from "../../components/branch/BranchFormModal";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import IconButton from "../../components/common/buttons/IconButton";
import Badge from "../../components/common/data/Badge";
import DataTable from "../../components/common/data/DataTable";
import Pagination from "../../components/common/data/Pagination";
import SearchInput from "../../components/common/forms/SearchInput";
import Icon from "../../components/common/icons/Icon";
import PageHeader from "../../components/common/layout/PageHeader";
import ConfirmModal from "../../components/common/modals/ConfirmModal";
import { BRANCH_STATUS } from "../../constants/branch";
import { ROUTES } from "../../constants/routes";
import { useBranch } from "../../hooks/useBranch";
import { useBranchesData, useDeleteBranch } from "../../hooks/useBranchApi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { formatShortDate } from "../../utils/formatDate";
import { rowNumber } from "../../utils/pagination";

const Branches = () => {
  const navigate = useNavigate();
  const { enterBranch } = useBranch();

  // all states
  const [notice, setNotice] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  // null = closed, { branch: null } = create, { branch } = edit
  const [form, setForm] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // call branch api (search and paging run on the backend)
  const { data, isLoading, error } = useBranchesData({ search, page, limit });
  const deleteBranch = useDeleteBranch();
  const branches = data?.data ?? [];
  const meta = data?.meta;

  const handleSearch = (value) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleLimitChange = (value) => {
    setLimit(value);
    setPage(1);
  };

  const openForm = (branch) => {
    setNotice("");
    setForm({ branch });
  };

  const handleSaved = (saved, isEdit) => {
    setForm(null);
    setNotice(isEdit ? `"${saved.name}" updated.` : `"${saved.name}" created.`);
  };

  const handleLogin = (branch) => {
    enterBranch(branch);
    navigate(ROUTES.BRANCH_HOME);
  };

  const handleDelete = async () => {
    await deleteBranch.mutateAsync(deleting._id);
    setNotice(`"${deleting.name}" deleted.`);
    setDeleting(null);
    // The page's last row is gone: go back a page
    if (branches.length === 1 && page > 1) setPage(page - 1);
  };

  const columns = [
    { key: "index", header: "#", className: "text-slate-500", render: (_, i) => rowNumber(meta, i) },
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

      <SearchInput value={searchInput} onChange={handleSearch} placeholder="Search branch..." className="mt-6 max-w-sm" />

      <div className="mt-4 space-y-2">
        <Alert type="success">{notice}</Alert>
        <Alert>{error?.message}</Alert>
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={branches}
          loading={isLoading}
          minWidth={960}
          emptyMessage={search ? `No branch matches "${search}".` : "No branches yet. Create your first branch."}
        />
        <Pagination meta={meta} onPageChange={setPage} onLimitChange={handleLimitChange} />
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
