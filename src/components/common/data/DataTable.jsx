import Spinner from "../loaders/Spinner";

// columns: [{ key, header, render(row, index), className, headerClassName, sticky }]
// sticky: "right" pins that column (e.g. the actions) to the right edge while the table scrolls sideways.
const STICKY_RIGHT = "sticky right-0 z-10 shadow-[-8px_0_8px_-8px_rgba(15,23,42,0.15)]";
const DataTable = ({ columns, rows, loading, emptyMessage = "No records found.", rowKey = "_id", minWidth = 900 }) => {
  const colSpan = columns.length;

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <table className="w-full text-left text-sm" style={{ minWidth }}>
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-700">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`whitespace-nowrap px-4 py-3 font-semibold ${col.sticky === "right" ? `${STICKY_RIGHT} bg-slate-50` : ""} ${col.headerClassName || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr>
              <td colSpan={colSpan} className="py-16">
                <div className="flex justify-center">
                  <Spinner className="h-6 w-6 text-brand" />
                </div>
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={colSpan} className="py-16 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={row[rowKey]} className="group hover:bg-slate-50">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 align-middle ${col.sticky === "right" ? `${STICKY_RIGHT} bg-white group-hover:bg-slate-50` : ""} ${col.className || ""}`}
                  >
                    {col.render ? col.render(row, index) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
