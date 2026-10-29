import Icon from "../icons/Icon";

const SearchInput = ({ value, onChange, placeholder = "Search...", className = "" }) => (
  <div className={`relative ${className}`}>
    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
      <Icon name="search" />
    </span>
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-brand/10"
    />
  </div>
);

export default SearchInput;
