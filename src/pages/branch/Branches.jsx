import { useState } from "react";
import { useNavigate } from "react-router";
import BranchCards from "../../components/branch/BranchCards";
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
    setForm({ branch });
  };

  const handleSaved = () => {
    setForm(null);
  };

  const handleLogin = (branch) => {
    enterBranch(branch);
    navigate(ROUTES.BRANCH_HOME);
  };

  const handleDelete = async () => {
    await deleteBranch.mutateAsync(deleting._id);
    setDeleting(null);
    // The page's last row is gone: go back a page
    if (branches.length === 1 && page > 1) setPage(page - 1);
  };

  const emptyMessage = search ? `No branch matches "${search}".` : "No branches yet. Create your first branch.";

  const columns = [
    { key: "index", header: "#", className: "text-slate-500", render: (_, i) => rowNumber(meta, i) },
    { key: "name", header: "Branch Name", className: "min-w-40 font-medium text-slate-900" },
    { key: "address", header: "Address", className: "min-w-48 text-slate-600" },
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
    { key: "createdAt", header: "Created Date", className: "whitespace-nowrap text-slate-600", render: (b) => formatShortDate(b.createdAt) },
    {
      key: "actions",
      header: "Action",
      sticky: "right",
      headerClassName: "text-right",
      render: (b) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => handleLogin(b)}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover"
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
        <Alert>{error?.message}</Alert>
      </div>

      <div className="mt-4">
        {/* Cards on phones, the table from sm */}
        <div className="sm:hidden">
          <BranchCards
            branches={branches}
            loading={isLoading}
            emptyMessage={emptyMessage}
            onLogin={handleLogin}
            onEdit={openForm}
            onDelete={setDeleting}
          />
        </div>
        <div className="hidden sm:block">
          <DataTable columns={columns} rows={branches} loading={isLoading} minWidth={720} emptyMessage={emptyMessage} />
        </div>
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
