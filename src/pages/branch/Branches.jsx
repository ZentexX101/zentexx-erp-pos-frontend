import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import BranchFormModal from "../../components/branch/BranchFormModal";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import Spinner from "../../components/common/loaders/Spinner";
import Modal from "../../components/common/modals/Modal";
import { BRANCH_STATUS } from "../../constants/branch";
import { ROUTES } from "../../constants/routes";
import { useBranch } from "../../hooks/useBranch";
import { branchService } from "../../services/branchService";
import { formatShortDate } from "../../utils/formatDate";

const SEARCH_DELAY_MS = 300;

const Icon = ({ d, className = "h-4 w-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d={d} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ICONS = {
  plus: "M12 5v14M5 12h14",
  search: "M21 21l-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z",
  login: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3",
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
      status === BRANCH_STATUS.ACTIVE ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"
    }`}
  >
    {status === BRANCH_STATUS.ACTIVE ? "Active" : "Inactive"}
  </span>
);

const Branches = () => {
  const navigate = useNavigate();
  const { enterBranch } = useBranch();

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // null = closed, { branch: null } = create, { branch } = edit
  const [form, setForm] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

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

  const handleSaved = (saved, isEdit) => {
    setForm(null);
    setNotice(isEdit ? `"${saved.name}" updated.` : `"${saved.name}" created.`);
    load();
  };

  const handleLogin = (branch) => {
    enterBranch(branch);
    navigate(ROUTES.BRANCH_HOME);
  };

  const closeDeleteModal = useCallback(() => {
    setDeleting(null);
    setDeleteError("");
  }, []);

  const handleDelete = async () => {
    setDeleteBusy(true);
    setDeleteError("");
    try {
      await branchService.remove(deleting._id);
      setNotice(`"${deleting.name}" deleted.`);
      closeDeleteModal();
      load();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Branch</h1>
          <p className="mt-1 text-sm text-slate-500">Manage all branches</p>
        </div>
        <Button
          onClick={() => {
            setNotice("");
            setForm({ branch: null });
          }}
        >
          <Icon d={ICONS.plus} />
          Create Branch
        </Button>
      </div>

      <div className="relative mt-6 max-w-sm">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
          <Icon d={ICONS.search} />
        </span>
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search branch..."
          aria-label="Search branch"
          className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="mt-4 space-y-2">
        <Alert type="success">{notice}</Alert>
        <Alert>{error}</Alert>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-3 font-semibold">#</th>
              <th className="px-4 py-3 font-semibold">Branch Name</th>
              <th className="px-4 py-3 font-semibold">Address</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">ZKTeco Terminal</th>
              <th className="px-4 py-3 font-semibold">Connection</th>
              <th className="px-4 py-3 font-semibold">Created Date</th>
              <th className="px-4 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-16">
                  <div className="flex justify-center">
                    <Spinner className="h-6 w-6 text-blue-600" />
                  </div>
                </td>
              </tr>
            ) : branches.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-slate-500">
                  {search ? `No branch matches "${search}".` : "No branches yet. Create your first branch."}
                </td>
              </tr>
            ) : (
              branches.map((branch, index) => (
                <tr key={branch._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{branch.name}</td>
                  <td className="px-4 py-3 text-slate-600">{branch.address}</td>
                  <td className="px-4 py-3 text-slate-700">{branch.phone}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={branch.status} />
                  </td>
                  <td className="px-4 py-3">
                    {branch.zkteco?.enabled ? (
                      <span className="font-mono text-xs text-slate-700">
                        {branch.zkteco.ip}:{branch.zkteco.port}
                      </span>
                    ) : (
                      <span className="italic text-slate-400">Not configured</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-xs ${
                        branch.zkteco?.enabled
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-slate-50 text-slate-500"
                      }`}
                    >
                      {branch.zkteco?.enabled ? "Configured" : "Not Configured"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatShortDate(branch.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleLogin(branch)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-green-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-800"
                      >
                        <Icon d={ICONS.login} className="h-3.5 w-3.5" />
                        Login
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNotice("");
                          setForm({ branch });
                        }}
                        aria-label={`Edit ${branch.name}`}
                        className="rounded-md border border-slate-300 p-1.5 text-slate-700 hover:bg-slate-100"
                      >
                        <Icon d={ICONS.edit} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNotice("");
                          setDeleting(branch);
                        }}
                        aria-label={`Delete ${branch.name}`}
                        className="rounded-md bg-red-600 p-1.5 text-white hover:bg-red-700"
                      >
                        <Icon d={ICONS.trash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {form && <BranchFormModal branch={form.branch} onClose={() => setForm(null)} onSaved={handleSaved} />}

      <Modal
        isOpen={Boolean(deleting)}
        onClose={closeDeleteModal}
        title="Delete branch"
        footer={
          <>
            <Button variant="secondary" onClick={closeDeleteModal} disabled={deleteBusy}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleteBusy}>
              Delete
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Delete <span className="font-medium text-slate-900">{deleting?.name}</span>? This can't be undone. A branch that
            still has staff can't be deleted; set it to inactive instead.
          </p>
          <Alert>{deleteError}</Alert>
        </div>
      </Modal>
    </div>
  );
};

export default Branches;
