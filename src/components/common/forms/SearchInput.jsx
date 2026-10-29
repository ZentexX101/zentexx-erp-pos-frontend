import { LuSearch, LuX } from "react-icons/lu";

// Search box for list pages; same height as the filter selects, with a clear button
const SearchInput = ({ value, onChange, placeholder = "Search...", className = "" }) => (
  <div className={`relative ${className}`}>
    <LuSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
    <input
      type="text"
      inputMode="search"
      enterKeyHint="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-9 text-sm text-slate-900 shadow-xs outline-none transition placeholder:text-slate-500 hover:border-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-brand/10"
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange("")}
        aria-label="Clear search"
        className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        <LuX className="size-3.5" aria-hidden="true" />
      </button>
    )}
  </div>
);

export default SearchInput;
