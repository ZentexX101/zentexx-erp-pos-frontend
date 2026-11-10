import { useEffect, useRef } from "react";
import { allPermissionKeys, groupModules, keyOf, normalizePermissions } from "../../utils/permissions";

const MAIN_ACTIONS = ["view", "create", "edit", "delete"];

// Checkbox that can show a "some ticked" state
const Check = ({ checked, indeterminate = false, onChange, label, className = "" }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate && !checked;
  }, [indeterminate, checked]);
  return (
    <input
      ref={ref}
      type="checkbox"
      aria-label={label}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className={`h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-blue-600 ${className}`}
    />
  );
};

// Ticked here but not in the role's defaults = added; in the defaults but unticked = removed
const diffTone = (on, inDefault) => {
  if (on && !inDefault) return "bg-emerald-50 ring-1 ring-emerald-300";
  if (!on && inDefault) return "bg-amber-50 ring-1 ring-amber-300";
  return "";
};

// One permission cell: a checkbox with its action name (the name is a column header on wider screens)
const ActionCell = ({ module, action, selected, defaults, actionLabels, onToggle, showName }) => {
  const key = keyOf(module, action);
  const on = selected.has(key);
  return (
    <label
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-xs text-slate-600 hover:bg-slate-100 ${diffTone(on, defaults?.has(key))}`}
    >
      <Check checked={on} onChange={(value) => onToggle([key], value)} label={`${module.label}: ${actionLabels[action] || action}`} />
      <span className={showName ? "" : "sm:hidden"}>{actionLabels[action] || action}</span>
    </label>
  );
};

// Module × action grid, grouped like the sidebar. catalog comes from usePermissionCatalogData();
// value / onChange use permission keys like "product.view". defaults = the chosen role's keys, used for
// "Reset to role defaults" and to mark what this person has added or lost compared with the role.
const PermissionPicker = ({ catalog, value, onChange, defaults = null, roleLabel = "" }) => {
  const selected = new Set(value);
  const defaultSet = defaults ? new Set(defaults) : null;
  const allKeys = allPermissionKeys(catalog);
  const customized = defaultSet && (defaultSet.size !== selected.size || [...selected].some((key) => !defaultSet.has(key)));

  // View can't be taken away while another action of the module stays ticked (and is added with it)
  const setKeys = (keys, on) => {
    const next = new Set(selected);
    for (const key of keys) {
      if (on) next.add(key);
      else {
        next.delete(key);
        if (key.endsWith(".view")) {
          const prefix = key.slice(0, -"view".length);
          allKeys.filter((k) => k.startsWith(prefix)).forEach((k) => next.delete(k));
        }
      }
    }
    onChange(normalizePermissions(catalog, [...next]));
  };

  const linkButton = "rounded-md px-2.5 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 px-4 py-3">
        <div className="min-w-48 flex-1">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{selected.size}</span> of {allKeys.length} permissions
            {defaultSet &&
              (customized ? (
                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Customized</span>
              ) : (
                <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">{roleLabel} defaults</span>
              ))}
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${(selected.size / allKeys.length) * 100}%` }} />
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {defaultSet && (
            <button
              type="button"
              disabled={!customized}
              onClick={() => onChange(defaults)}
              className={`${linkButton} text-blue-600 hover:bg-blue-50`}
            >
              Reset to {roleLabel || "role"} defaults
            </button>
          )}
          <button type="button" onClick={() => onChange(allKeys)} className={`${linkButton} text-slate-600 hover:bg-slate-200`}>
            Select all
          </button>
          <button type="button" disabled={!selected.size} onClick={() => onChange([])} className={`${linkButton} text-slate-600 hover:bg-slate-200`}>
            Clear
          </button>
        </div>
      </div>

      {customized && (
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded bg-emerald-50 ring-1 ring-emerald-300" /> Added on top of the role
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded bg-amber-50 ring-1 ring-amber-300" /> Taken away from the role
          </span>
        </p>
      )}

      {groupModules(catalog.modules).map(([group, modules]) => {
        const groupKeys = modules.flatMap((module) => module.actions.map((action) => keyOf(module, action)));
        const groupOn = groupKeys.filter((key) => selected.has(key)).length;
        return (
          <section key={group} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <header className="grid grid-cols-[1fr_auto] items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 sm:grid-cols-[minmax(0,1fr)_repeat(4,4.5rem)_9rem]">
              <label className="flex cursor-pointer items-center gap-2">
                <Check
                  checked={groupOn === groupKeys.length}
                  indeterminate={groupOn > 0}
                  onChange={(on) => setKeys(groupKeys, on)}
                  label={`All of ${group}`}
                />
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">{group}</span>
                <span className="text-xs text-slate-400">
                  {groupOn}/{groupKeys.length}
                </span>
              </label>
              {MAIN_ACTIONS.map((action) => (
                <span key={action} className="hidden text-center text-xs font-medium text-slate-500 sm:block">
                  {catalog.actionLabels[action]}
                </span>
              ))}
              <span className="hidden text-xs font-medium text-slate-500 sm:block">Other</span>
            </header>

            <ul className="divide-y divide-slate-100">
              {modules.map((module) => {
                const keys = module.actions.map((action) => keyOf(module, action));
                const on = keys.filter((key) => selected.has(key)).length;
                const extras = module.actions.filter((action) => !MAIN_ACTIONS.includes(action));
                const cellProps = { module, selected, defaults: defaultSet, actionLabels: catalog.actionLabels, onToggle: setKeys };
                return (
                  <li
                    key={module.key}
                    className="grid gap-2 px-3 py-2.5 sm:grid-cols-[minmax(0,1fr)_repeat(4,4.5rem)_9rem] sm:items-center sm:gap-2"
                  >
                    <label className="flex cursor-pointer items-start gap-2">
                      <Check
                        checked={on === keys.length}
                        indeterminate={on > 0}
                        onChange={(value) => setKeys(keys, value)}
                        label={`All of ${module.label}`}
                        className="mt-0.5"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-slate-800">{module.label}</span>
                        {module.description && <span className="block text-xs text-slate-400">{module.description}</span>}
                      </span>
                    </label>

                    {/* Phones: every action in a row. Wider screens: a column per main action, extras last. */}
                    <div className="flex flex-wrap gap-1 pl-6 sm:contents">
                      {MAIN_ACTIONS.map((action) =>
                        module.actions.includes(action) ? (
                          <div key={action} className="sm:flex sm:justify-center">
                            <ActionCell action={action} {...cellProps} />
                          </div>
                        ) : (
                          <span key={action} className="hidden text-center text-slate-300 sm:block" aria-hidden="true">
                            —
                          </span>
                        ),
                      )}
                      <div className="flex flex-wrap gap-1">
                        {extras.map((action) => (
                          <ActionCell key={action} action={action} showName {...cellProps} />
                        ))}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
};

export default PermissionPicker;
