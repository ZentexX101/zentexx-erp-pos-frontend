import { useCallback, useEffect, useRef, useState } from "react";

// One page of a backend list. Filtering and paging happen on the backend;
// changing the filters goes back to page 1.
//   fetchPage: (params) => response { data, meta } — must be stable (e.g. a service method)
//   filters:   query params, e.g. { search, status }
export const usePagedList = (fetchPage, filters, defaultLimit = 10) => {
  const filtersKey = JSON.stringify(filters);
  const [page, setPage] = useState(1);
  const [limit, setLimitState] = useState(defaultLimit);
  const [pageFilters, setPageFilters] = useState(filtersKey);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const latestRequest = useRef(0);

  // New filters: back to page 1 (set during render, so no request goes out with the old page)
  if (pageFilters !== filtersKey) {
    setPageFilters(filtersKey);
    setPage(1);
  }

  const reload = useCallback(async () => {
    const requestId = ++latestRequest.current;
    const isLatest = () => requestId === latestRequest.current;

    setLoading(true);
    setError("");
    try {
      const res = await fetchPage({ ...JSON.parse(filtersKey), page, limit });
      if (!isLatest()) return;

      // The last row of the last page was deleted: show the new last page
      if (page > res.meta.totalPages) {
        setPage(res.meta.totalPages);
        return;
      }
      setRows(res.data);
      setMeta(res.meta);
    } catch (err) {
      if (!isLatest()) return;
      setError(err.message);
      setRows([]);
    } finally {
      if (isLatest()) setLoading(false);
    }
  }, [fetchPage, filtersKey, page, limit]);

  useEffect(() => {
    reload();
  }, [reload]);

  // New page size: start again from page 1
  const setLimit = (value) => {
    setLimitState(value);
    setPage(1);
  };

  // Row number across pages for a "#" column
  const rowNumber = (index) => (meta ? (meta.page - 1) * meta.limit : 0) + index + 1;

  return { rows, meta, page, setPage, setLimit, loading, error, reload, rowNumber };
};
