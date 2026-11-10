// Helpers for the permission catalog from GET /staff/permissions ({ roles, modules, actionLabels }).

export const keyOf = (module, action) => `${module.key}.${action}`;

export const allPermissionKeys = (catalog) => catalog.modules.flatMap((module) => module.actions.map((action) => keyOf(module, action)));

// [[group, modules[]], ...] in catalog order
export const groupModules = (modules) => {
  const groups = new Map();
  for (const module of modules) {
    if (!groups.has(module.group)) groups.set(module.group, []);
    groups.get(module.group).push(module);
  }
  return [...groups.entries()];
};

// Same rule as the backend's normalizePermissions: known keys only, catalog order, and a module with any
// action ticked also gets its "view"
export const normalizePermissions = (catalog, list) => {
  const keys = new Set(list);
  for (const module of catalog.modules) {
    if (module.actions.includes("view") && module.actions.some((action) => keys.has(keyOf(module, action)))) {
      keys.add(keyOf(module, "view"));
    }
  }
  return allPermissionKeys(catalog).filter((key) => keys.has(key));
};

export const roleInfo = (catalog, role) => catalog?.roles.find((item) => item.value === role) ?? null;
