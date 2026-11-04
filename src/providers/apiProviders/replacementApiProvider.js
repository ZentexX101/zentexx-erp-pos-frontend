import { apiRequest } from "../../services/ApiRequestHandler";
import { toQueryString } from "../../utils/queryString";

// Replacements work in the current branch (apiRequest sends X-Branch-Id for main admins)

// ✅ Fetch Function — an invoice by its number or an IMEI -> { sale, devices, history, replacedBefore } (404 when none)
export const lookupSaleForReplacement = async (q) => (await apiRequest(`/replacements/lookup${toQueryString({ q })}`)).data;

// ✅ Fetch Function — params: { search, status, from, to, page, limit } -> { data, meta: { ...paging, summary } }
export const fetchReplacementsData = async (params) => apiRequest(`/replacements${toQueryString(params)}`);

// ✅ Swap a faulty piece — data: { sale, product, oldSerial, newSerial | quantity, reason, charge, payments, note }
export const createReplacement = async (data) => (await apiRequest("/replacements", { method: "POST", body: data })).data;

// ✅ Decide the faulty piece — status: "restocked" | "written_off"
export const resolveReplacement = async ({ id, status }) => (await apiRequest(`/replacements/${id}/resolve`, { method: "PATCH", body: { status } })).data;
