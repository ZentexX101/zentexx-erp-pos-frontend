// A short list table for dashboard cards: a few columns, no paging, scrolls sideways on phones.
// columns: [{ key, header, render, className }]
const MiniTable = ({ columns, rows, rowKey = "_id", emptyText = "Nothing here yet." }) =>
  rows.length === 0 ? (
    <p className="py-10 text-center text-sm text-slate-400">{emptyText}</p>
  ) : (
    <div className="-mx-4 overflow-x-auto sm:-mx-5">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead className="border-y border-slate-100 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={`px-4 py-2 font-semibold sm:px-5 ${column.className ?? ""}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row[rowKey]} className="hover:bg-slate-50">
              {columns.map((column) => (
                <td key={column.key} className={`px-4 py-2.5 sm:px-5 ${column.className ?? ""}`}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

export default MiniTable;
