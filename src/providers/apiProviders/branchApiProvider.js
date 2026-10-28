import { apiRequest } from "../../services/ApiRequestHandler";
import { toQueryString } from "../../utils/queryString";

// ✅ Fetch Function — one page of branches
// params: { search, status, page, limit } -> { data, meta }
export const fetchBranchesData = async (params) => {
  const response = await apiRequest(`/branches${toQueryString(params)}`);
  return response;
};

// ✅ Fetch Function — branches for dropdowns
// The backend's max page size (100) is plenty for branches
export const fetchBranchOptionsData = async (status) => {
  const response = await apiRequest(`/branches${toQueryString({ status, limit: 100 })}`);
  return response.data;
};

// ✅ Fetch Function — the branch this user works in
// Their own, or the one a main admin entered (sent with the X-Branch-Id header)
export const fetchCurrentBranchData = async () => {
  const response = await apiRequest("/branches/current");
  return response.data;
};

// ✅ Create branch
export const createBranch = async (data) => {
  const response = await apiRequest("/branches", { method: "POST", body: data });
  return response.data;
};

// ✅ Update branch
export const updateBranch = async (id, data) => {
  const response = await apiRequest(`/branches/${id}`, { method: "PATCH", body: data });
  return response.data;
};

// ✅ Delete branch
export const deleteBranch = async (id) => {
  const response = await apiRequest(`/branches/${id}`, { method: "DELETE" });
  return response;
};
