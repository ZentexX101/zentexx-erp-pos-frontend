// Must match USER_ROLES in the backend (src/modules/auth/user.constants.js).
// The role is the person's job. Owner and Admin are main admins (every branch, full access);
// every other role works in one branch with the permissions ticked for them.
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  BRANCH_MANAGER: "branch_manager",
  ACCOUNTANT: "accountant",
  HR_OFFICER: "hr_officer",
  SALES_EXECUTIVE: "sales_executive",
  CASHIER: "cashier",
  REPAIR_TECHNICIAN: "repair_technician",
  STORE_KEEPER: "store_keeper",
  DELIVERY_MAN: "delivery_man",
  STAFF: "staff",
};

export const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

export const BRANCH_ROLES = Object.values(ROLES).filter((role) => !ADMIN_ROLES.includes(role));

export const isBranchRole = (role) => BRANCH_ROLES.includes(role);

// Must match REVIEWER_ROLES in the backend — who can approve / reject registrations
export const REVIEWER_ROLES = ADMIN_ROLES;

// Main admin = an admin not tied to a branch (same rule as the backend's isMainAdmin).
// Everyone with a branch works only inside that branch.
export const isMainAdmin = (user) => Boolean(user) && ADMIN_ROLES.includes(user.role) && !user.branch;

// Roles a main admin can give; only the owner can give "admin".
// Must match the backend's staff rules (src/modules/staff/staff.service.js)
export const getAssignableRoles = (actor) => [actor?.role === ROLES.SUPER_ADMIN && ROLES.ADMIN, ...BRANCH_ROLES].filter(Boolean);

// The owner manages everyone; an admin manages branch staff only; nobody edits themselves here
export const canManageUser = (actor, target) => actor._id !== target._id && (actor.role === ROLES.SUPER_ADMIN || isBranchRole(target.role));

export const USER_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

// Must match ROLE_LABELS in the backend
export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: "Owner",
  [ROLES.ADMIN]: "Admin",
  [ROLES.BRANCH_MANAGER]: "Branch Manager",
  [ROLES.ACCOUNTANT]: "Accountant",
  [ROLES.HR_OFFICER]: "HR Officer",
  [ROLES.SALES_EXECUTIVE]: "Sales Executive",
  [ROLES.CASHIER]: "Cashier",
  [ROLES.REPAIR_TECHNICIAN]: "Repair Technician",
  [ROLES.STORE_KEEPER]: "Store Keeper",
  [ROLES.DELIVERY_MAN]: "Delivery Man",
  [ROLES.STAFF]: "Staff",
};

// Badge colour per role in staff lists
export const ROLE_TONES = {
  [ROLES.SUPER_ADMIN]: "purple",
  [ROLES.ADMIN]: "blue",
  [ROLES.BRANCH_MANAGER]: "amber",
};

// Must match WEEK_DAYS in the backend
export const WEEK_DAYS = [
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
];
