import { getInitials } from "../../utils/initials";

// A person's initials, name and job, used in every HR list
const PersonCell = ({ person }) => (
  <span className="flex min-w-0 items-center gap-3">
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600" aria-hidden="true">
      {getInitials(person?.name ?? "?")}
    </span>
    <span className="min-w-0">
      <span className="block truncate font-medium text-slate-900">{person?.name ?? "—"}</span>
      <span className="block truncate text-xs text-slate-500">{person?.designation || (person?.staffCode ? `ID ${person.staffCode}` : "Staff")}</span>
    </span>
  </span>
);

export default PersonCell;
