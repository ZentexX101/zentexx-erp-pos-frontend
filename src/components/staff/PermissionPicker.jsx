import Icon from "../common/icons/Icon";

const groupModules = (modules) =>
  modules.reduce((groups, module) => {
    (groups[module.group] ||= []).push(module);
    return groups;
  }, {});

// Grid of module × action checkboxes. catalog comes from staffService.getPermissionCatalog();
// value / onChange use permission keys like "product.view".
const PermissionPicker = ({ catalog, value, onChange }) => {
  const selected = new Set(value);
  const allKeys = catalog.modules.flatMap((m) => m.actions.map((a) => `${m.key}.${a}`));

  const setKeys = (keys, on) => {
    const next = new Set(selected);
    keys.forEach((key) => (on ? next.add(key) : next.delete(key)));
    onChange(allKeys.filter((key) => next.has(key)));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{selected.size}</span> of {allKeys.length} selected
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange(allKeys)}
            className="rounded-md px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={() => onChange([])}
            className="rounded-md px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            Clear
          </button>
        </div>
      </div>

      {Object.entries(groupModules(catalog.modules)).map(([group, modules]) => (
        <div key={group}>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{group}</p>
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {modules.map((module) => {
              const keys = module.actions.map((action) => `${module.key}.${action}`);
              const allOn = keys.every((key) => selected.has(key));
              return (
                <div key={module.key} className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={allOn}
                      onChange={(e) => setKeys(keys, e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                    />
                    {module.label}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {module.actions.map((action) => {
                      const key = `${module.key}.${action}`;
                      const on = selected.has(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          aria-pressed={on}
                          onClick={() => setKeys([key], !on)}
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition ${
                            on
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                          }`}
                        >
                          {on && <Icon name="check" className="h-3 w-3" />}
                          {catalog.actionLabels[action] || action}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PermissionPicker;
