import { ROLE_LABELS, ROLES } from "../../constants/roles";
import Badge from "../common/data/Badge";
import Modal from "../common/modals/Modal";

// Read-only list of a staff member's permissions, grouped by module
const PermissionsViewModal = ({ staff, catalog, onClose }) => {
  const isAdmin = staff.role !== ROLES.SUB_ADMIN;
  const granted = new Set(staff.permissions);
  const modules = (catalog?.modules || [])
    .map((module) => ({ ...module, actions: module.actions.filter((a) => granted.has(`${module.key}.${a}`)) }))
    .filter((module) => module.actions.length);

  return (
    <Modal isOpen onClose={onClose} title="Permissions" subtitle={`${staff.name} · ${ROLE_LABELS[staff.role]}`} size="lg">
      {isAdmin ? (
        <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {ROLE_LABELS[staff.role]} has full access to every module in every branch.
        </p>
      ) : !catalog ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : modules.length === 0 ? (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No permissions yet. Edit this staff member to give access to modules.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          {modules.map((module) => (
            <li key={module.key} className="flex flex-col gap-1.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">{module.label}</p>
                <p className="text-xs text-slate-400">{module.group}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {module.actions.map((action) => (
                  <Badge key={action} tone="blue">
                    {catalog.actionLabels[action] || action}
                  </Badge>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
};

export default PermissionsViewModal;
