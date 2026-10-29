import { LuX } from "react-icons/lu";

// Search box + filter controls in one row. Phones: search on top, filters in a 2-column grid.
// Pass onClear only while a filter is applied to show the "Clear" button.
const FilterBar = ({ search, children, onClear, className = "" }) => (
  <div className={`flex flex-col gap-3 lg:flex-row lg:items-center ${className}`}>
    {search && <div className="w-full lg:w-80 lg:shrink-0">{search}</div>}
    <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end">
      {children}
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="flex h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <LuX className="size-4" aria-hidden="true" />
          Clear
        </button>
      )}
    </div>
  </div>
);

export default FilterBar;
