import { apiRequest } from "../../services/ApiRequestHandler";
import { toQueryString } from "../../utils/queryString";

// HR works in the current branch (apiRequest sends X-Branch-Id for main admins)

// ✅ A person's own page -> { user, today, attendance, month, slips, leaves }
export const fetchMyHrData = async () => (await apiRequest("/hr/me")).data;
// A person's history: their own (no staffId), or a staff member an admin opened
const personPath = (staffId) => (staffId ? `/hr/staff/${staffId}` : "/hr/me");
export const fetchMyLeavesData = async (params, staffId) => apiRequest(`${personPath(staffId)}/leaves${toQueryString(params)}`);
export const fetchMyPayslipsData = async (params, staffId) => apiRequest(`${personPath(staffId)}/payslips${toQueryString(params)}`);
export const fetchMyMoneyData = async (staffId) => (await apiRequest(`${personPath(staffId)}/money`)).data;
export const fetchMyIncentivesData = async (month, staffId) => (await apiRequest(`${personPath(staffId)}/incentives${toQueryString({ month })}`)).data;
// ✅ Staff files (an admin) — params: { branch, search, month, page, limit }
export const fetchStaffListData = async (params) => apiRequest(`/hr/staff${toQueryString(params)}`);
export const fetchStaffFileData = async (id) => (await apiRequest(`/hr/staff/${id}`)).data;
export const checkIn = async () => (await apiRequest("/hr/me/check-in", { method: "POST" })).data;
export const checkOut = async () => (await apiRequest("/hr/me/check-out", { method: "POST" })).data;
export const requestLeave = async (data) => (await apiRequest("/hr/me/leaves", { method: "POST", body: data })).data;
export const cancelLeave = async (id) => (await apiRequest(`/hr/me/leaves/${id}`, { method: "DELETE" })).data;

// ✅ Attendance — the day's board, one person's month, a manager's correction
export const fetchDayBoardData = async (day) => (await apiRequest(`/hr/attendance${toQueryString({ day })}`)).data;
export const fetchAttendanceRegisterData = async (month) => (await apiRequest(`/hr/attendance/register${toQueryString({ month })}`)).data;
export const fetchMonthSheetData = async ({ month, staffId }) =>
  (await apiRequest(staffId ? `/hr/staff/${staffId}/sheet${toQueryString({ month })}` : `/hr/attendance/sheet${toQueryString({ month })}`)).data;
export const markAttendance = async (data) => (await apiRequest("/hr/attendance", { method: "PUT", body: data })).data;

// ✅ Leaves — params: { status, user, page, limit } -> { data, meta: { ...paging, summary: { pending } } }
export const fetchLeavesData = async (params) => apiRequest(`/hr/leaves${toQueryString(params)}`);
export const addLeave = async (data) => (await apiRequest("/hr/leaves", { method: "POST", body: data })).data;
export const reviewLeave = async ({ id, ...data }) => (await apiRequest(`/hr/leaves/${id}`, { method: "PATCH", body: data })).data;

// ✅ Salary — a month's rows, and paying one person
export const fetchPayrollData = async (month) => (await apiRequest(`/hr/salaries${toQueryString({ month })}`)).data;
export const paySalary = async (data) => (await apiRequest("/hr/salaries", { method: "POST", body: data })).data;

// ✅ Incentive, increment, advance
export const fetchIncentivesData = async (month) => (await apiRequest(`/hr/incentives${toQueryString({ month })}`)).data;
export const fetchIncrementsData = async (params) => apiRequest(`/hr/increments${toQueryString(params)}`);
export const createIncrement = async (data) => (await apiRequest("/hr/increments", { method: "POST", body: data })).data;
export const fetchAdvancesData = async (params) => apiRequest(`/hr/advances${toQueryString(params)}`);
export const giveAdvance = async (data) => (await apiRequest("/hr/advances", { method: "POST", body: data })).data;
