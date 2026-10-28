import { LuChevronDown, LuChevronLeft, LuChevronRight } from "react-icons/lu";

// The backend allows at most 100 per page
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Page numbers to show: up to 5 in a row around the current page, plus the first and last
const getPages = (page, totalPages) => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = start + 4;
  const pages = [];

  if (start > 1) pages.push(1);
  if (start > 2) pages.push("...");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < totalPages - 1) pages.push("...");
  if (end < totalPages) pages.push(totalPages);
  return pages;
};

const boxClass =
  "flex h-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40";

// Footer for a backend-paginated table. meta: { page, limit, total, totalPages }
// onLimitChange is optional; without it the "Result per page" select is hidden.
const Pagination = ({ meta, onPageChange, onLimitChange, limitOptions = PAGE_SIZE_OPTIONS }) => {
  if (!meta || meta.total === 0) return null;

  const { page, limit, total, totalPages } = meta;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="mt-3 flex flex-col items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200 lg:flex-row lg:justify-between">
      {/* Range */}
      <span className={`${boxClass} border-slate-200 bg-slate-50 px-3 text-slate-700`}>
        {from}–{to} of {total}
      </span>

      {/* Pages */}
      <nav className="flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={`${boxClass} gap-0.5 border-slate-200 px-2.5 text-slate-600 hover:bg-slate-50`}
        >
          <LuChevronLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>

        {getPages(page, totalPages).map((p, i) =>
          p === "..." ? (
            <span key={`gap-${i}`} className="px-1.5 text-sm text-slate-400">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              aria-label={`Page ${p}`}
              className={`${boxClass} min-w-9 px-2 ${
                p === page
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                  : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={`${boxClass} gap-0.5 border-slate-200 px-2.5 text-slate-600 hover:bg-slate-50`}
        >
          Next
          <LuChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </nav>

      {/* Page size */}
      {onLimitChange ? (
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Result per page
          <span className="relative">
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="h-9 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              {limitOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <LuChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          </span>
        </label>
      ) : (
        <span className="hidden lg:block" />
      )}
    </div>
  );
};

export default Pagination;
