// A short list table for dashboard cards: a few columns, no paging.
// columns: [{ key, header, render, className }]
// Phones get a stacked list instead of a sideways-scrolling table, so the amount never hides off screen:
// the first column is the title, the `mobileEnd` column (default: the last) sits on the right,
// and the rest go under the title as small "Header value" bits.
const MiniTable = ({ columns, rows, rowKey = "_id", mobileEnd, emptyText = "Nothing here yet." }) => {
  if (rows.length === 0) return <p className="py-10 text-center text-sm text-slate-400">{emptyText}</p>;

  const [title, ...others] = columns;
  const end = others.find((column) => column.key === mobileEnd) ?? others[others.length - 1];
  const meta = others.filter((column) => column !== end);

  return (
    <>
      {/* Phones */}
      <ul className="-mx-4 divide-y divide-slate-100 border-t border-slate-100 sm:hidden">
        {rows.map((row) => (
          <li key={row[rowKey]} className="flex items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="break-words text-sm">{title.render(row)}</div>
              {meta.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-600">
                  {meta.map((column) => (
                    <span key={column.key} className="min-w-0 break-words">
                      <span className="text-slate-400">{column.header} </span>
                      {column.render(row)}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {end && <div className="shrink-0 text-right text-sm">{end.render(row)}</div>}
          </li>
        ))}
      </ul>

      {/* Tablets and up */}
      <div className="-mx-5 hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-y border-slate-100 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={`px-5 py-2 font-semibold ${column.className ?? ""}`}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row[rowKey]} className="hover:bg-slate-50">
                {columns.map((column) => (
                  <td key={column.key} className={`px-5 py-2.5 ${column.className ?? ""}`}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default MiniTable;
