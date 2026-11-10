import { isBranchRole, ROLE_LABELS } from "../../constants/roles";
import { groupModules, keyOf, roleInfo } from "../../utils/permissions";
import Badge from "../common/data/Badge";
import Modal from "../common/modals/Modal";

// Read-only view of a staff member's permissions, grouped like the form, with what differs from their role
const PermissionsViewModal = ({ staff, catalog, onClose }) => {
  const roleLabel = ROLE_LABELS[staff.role] || staff.role;
  const granted = new Set(staff.permissions);
  const defaults = new Set(roleInfo(catalog, staff.role)?.permissions ?? []);
  const added = [...granted].filter((key) => !defaults.has(key)).length;
  const removed = [...defaults].filter((key) => !granted.has(key)).length;

  const groups = groupModules(catalog?.modules || [])
    .map(([group, modules]) => [
      group,
      modules
        .map((module) => ({ ...module, granted: module.actions.filter((action) => granted.has(keyOf(module, action))) }))
        .filter((module) => module.granted.length),
    ])
    .filter(([, modules]) => modules.length);

  return (
    <Modal isOpen onClose={onClose} title="Permissions" subtitle={`${staff.name} · ${roleLabel}${staff.branch ? ` · ${staff.branch.name}` : ""}`} size="lg">
      {!isBranchRole(staff.role) ? (
        <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">{roleLabel} has full access to every module in every branch.</p>
      ) : !catalog ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span>
              <span className="font-semibold text-slate-900">{granted.size}</span> permissions
            </span>
            {added || removed ? (
              <>
                <Badge tone="amber">Customized</Badge>
                {added > 0 && <span className="text-xs text-emerald-700">+{added} beyond {roleLabel}</span>}
                {removed > 0 && <span className="text-xs text-amber-700">−{removed} from {roleLabel}</span>}
              </>
            ) : (
              <Badge tone="blue">{roleLabel} defaults</Badge>
            )}
          </div>

          {groups.length === 0 ? (
            <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">No permissions yet. Edit this staff member to give access to modules.</p>
          ) : (
            groups.map(([group, modules]) => (
              <section key={group}>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{group}</p>
                <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {modules.map((module) => (
                    <li key={module.key} className="flex flex-col gap-1.5 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-medium text-slate-900">{module.label}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {module.granted.map((action) => (
                          <Badge key={action} tone={defaults.has(keyOf(module, action)) ? "blue" : "green"}>
                            {catalog.actionLabels[action] || action}
                          </Badge>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      )}
    </Modal>
  );
};

export default PermissionsViewModal;
