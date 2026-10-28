// { search: "ca", status: "", page: 2 } -> "?search=ca&page=2" (empty values are left out)
export const toQueryString = (params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ).toString();
  return query ? `?${query}` : "";
};
