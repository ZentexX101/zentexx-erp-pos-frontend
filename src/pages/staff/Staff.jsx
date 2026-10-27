import { useCallback, useEffect, useState } from "react";
import Alert from "../../components/common/alerts/Alert";
import Button from "../../components/common/buttons/Button";
import Spinner from "../../components/common/loaders/Spinner";
import Modal from "../../components/common/modals/Modal";
import ResetPasswordModal from "../../components/staff/ResetPasswordModal";
import StaffFormModal from "../../components/staff/StaffFormModal";
import { canManageUser, ROLE_LABELS, ROLES } from "../../constants/roles";
import { useAuth } from "../../hooks/useAuth";
import { branchService } from "../../services/branchService";
import { staffService } from "../../services/staffService";
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
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z",
  key: "M15 7a2 2 0 1 1 0 .01M21 2l-9.6 9.6a5.5 5.5 0 1 1-1.4-1.4L19.6 .6M15.5 7.5L18 10l3-3-2.5-2.5",
};

const ROLE_STYLES = {
  [ROLES.SUPER_ADMIN]: "bg-purple-100 text-purple-700",
  [ROLES.ADMIN]: "bg-blue-100 text-blue-700",
  [ROLES.MANAGER]: "bg-amber-100 text-amber-700",
  [ROLES.STAFF]: "bg-slate-100 text-slate-700",
};

const FILTER_CLASS =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const Staff = () => {
  const { user: actor } = useAuth();

  const [staff, setStaff] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({ search: "", role: "", branch: "" });

  // null = closed, { staff: null } = create, { staff } = edit
  const [form, setForm] = useState(null);
  const [resetting, setResetting] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [toggleBusy, setToggleBusy] = useState(false);
  const [toggleError, setToggleError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setFilters((prev) => ({ ...prev, search: searchInput.trim() })), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setStaff(await staffService.getStaff(filters));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    branchService
      .getBranches()
      .then(setBranches)
      .catch((err) => setError(err.message));
  }, []);

  const openForm = (target) => {
    setNotice("");
    setForm({ staff: target });
  };

  const handleSaved = (saved, isEdit) => {
    setForm(null);
    setNotice(isEdit ? `${saved.name} updated.` : `${saved.name} created. They can sign in now.`);
    load();
  };

  const closeToggle = useCallback(() => {
    setToggling(null);
    setToggleError("");
  }, []);

  const handleToggle = async () => {
    setToggleBusy(true);
    setToggleError("");
    try {
      const updated = await staffService.setActive(toggling._id, !toggling.isActive);
      setNotice(`${updated.name} ${updated.isActive ? "activated" : "deactivated"}.`);
      closeToggle();
      load();
    } catch (err) {
      setToggleError(err.message);
    } finally {
      setToggleBusy(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Staff</h1>
          <p className="mt-1 text-sm text-slate-500">Manage staff, their roles and branches</p>
        </div>
        <Button onClick={() => openForm(null)}>
          <Icon d={ICONS.plus} />
          Create Staff
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative sm:w-72">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Icon d={ICONS.search} />
          </span>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name, email, phone..."
            aria-label="Search staff"
            className={`${FILTER_CLASS} w-full pl-9`}
          />
        </div>
        <select
          value={filters.branch}
          onChange={(e) => setFilters((prev) => ({ ...prev, branch: e.target.value }))}
          aria-label="Filter by branch"
          className={FILTER_CLASS}
        >
          <option value="">All branches</option>
          <option value="none">Main admin (no branch)</option>
          {branches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          value={filters.role}
          onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
          aria-label="Filter by role"
          className={FILTER_CLASS}
        >
          <option value="">All roles</option>
          {Object.values(ROLES).map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 space-y-2">
        <Alert type="success">{notice}</Alert>
        <Alert>{error}</Alert>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-3 font-semibold">#</th>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Branch</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Last Login</th>
              <th className="px-4 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-16">
                  <div className="flex justify-center">
                    <Spinner className="h-6 w-6 text-blue-600" />
                  </div>
                </td>
              </tr>
            ) : staff.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-slate-500">
                  No staff found.
                </td>
              </tr>
            ) : (
              staff.map((member, index) => {
                const isSelf = member._id === actor._id;
                const manageable = canManageUser(actor, member);
                return (
                  <tr key={member._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {member.name}
                        {isSelf && <span className="ml-2 text-xs font-normal text-slate-400">(you)</span>}
                      </p>
                      <p className="text-xs text-slate-500">{member.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{member.phone || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_STYLES[member.role]}`}>
                        {ROLE_LABELS[member.role] || member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {member.branch ? (
                        member.branch.name
                      ) : [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(member.role) ? (
                        <span className="text-slate-500">Main admin</span>
                      ) : (
                        <span className="font-medium text-red-600">Not assigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          member.isActive ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {member.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {member.lastLoginAt ? formatShortDate(member.lastLoginAt) : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      {manageable ? (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openForm(member)}
                            aria-label={`Edit ${member.name}`}
                            title="Edit role / branch"
                            className="rounded-md border border-slate-300 p-1.5 text-slate-700 hover:bg-slate-100"
                          >
                            <Icon d={ICONS.edit} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setNotice("");
                              setResetting(member);
                            }}
                            aria-label={`Reset password for ${member.name}`}
                            title="Reset password"
                            className="rounded-md border border-slate-300 p-1.5 text-slate-700 hover:bg-slate-100"
                          >
                            <Icon d={ICONS.key} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setNotice("");
                              setToggling(member);
                            }}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                              member.isActive
                                ? "border border-red-200 text-red-600 hover:bg-red-50"
                                : "bg-green-700 text-white hover:bg-green-800"
                            }`}
                          >
                            {member.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      ) : (
                        <p className="text-right text-xs text-slate-400">{isSelf ? "—" : "Owner only"}</p>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {form && (
        <StaffFormModal staff={form.staff} branches={branches} onClose={() => setForm(null)} onSaved={handleSaved} />
      )}

      {resetting && (
        <ResetPasswordModal
          staff={resetting}
          onClose={() => setResetting(null)}
          onDone={(member) => {
            setResetting(null);
            setNotice(`Password reset for ${member.name}.`);
          }}
        />
      )}

      <Modal
        isOpen={Boolean(toggling)}
        onClose={closeToggle}
        title={toggling?.isActive ? "Deactivate staff" : "Activate staff"}
        footer={
          <>
            <Button variant="secondary" onClick={closeToggle} disabled={toggleBusy}>
              Cancel
            </Button>
            <Button variant={toggling?.isActive ? "danger" : "primary"} onClick={handleToggle} loading={toggleBusy}>
              {toggling?.isActive ? "Deactivate" : "Activate"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            {toggling?.isActive ? (
              <>
                <span className="font-medium text-slate-900">{toggling?.name}</span> will be logged out and won't be able
                to sign in until reactivated.
              </>
            ) : (
              <>
                <span className="font-medium text-slate-900">{toggling?.name}</span> will be able to sign in again.
              </>
            )}
          </p>
          <Alert>{toggleError}</Alert>
        </div>
      </Modal>
    </div>
  );
};

export default Staff;
