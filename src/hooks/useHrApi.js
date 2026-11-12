import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatTaka } from "../utils/money";
import * as api from "../providers/apiProviders/hrApiProvider";
import { branchStorage } from "../services/branchStorage";

const HR_KEY = "hr";

// HR belongs to a branch, so the key holds the branch a main admin entered
const key = (...parts) => [HR_KEY, branchStorage.getId() ?? "own", ...parts];

const useList = (parts, fn, options = {}) => useQuery({ queryKey: key(...parts), queryFn: fn, placeholderData: keepPreviousData, staleTime: 0, ...options });

export const useMyHrData = (options) => useList(["me"], api.fetchMyHrData, options);
export const useMyLeavesData = (params, staffId) => useList(["person-leaves", staffId, params], () => api.fetchMyLeavesData(params, staffId));
export const useMyPayslipsData = (params, staffId) => useList(["person-payslips", staffId, params], () => api.fetchMyPayslipsData(params, staffId));
export const useMyMoneyData = (staffId) => useList(["person-money", staffId], () => api.fetchMyMoneyData(staffId));
export const useMyIncentivesData = (month, staffId) => useList(["person-incentives", staffId, month], () => api.fetchMyIncentivesData(month, staffId));
export const useStaffListData = (params) => useList(["staff-list", params], () => api.fetchStaffListData(params));
export const useStaffFileData = (id) => useList(["staff-file", id], () => api.fetchStaffFileData(id));
export const useDayBoardData = (day, options) => useList(["board", day], () => api.fetchDayBoardData(day), options);
export const useAttendanceRegisterData = (month, options) => useList(["register", month], () => api.fetchAttendanceRegisterData(month), options);
export const useMonthSheetData = (params, options) => useList(["sheet", params], () => api.fetchMonthSheetData(params), options);
export const useLeavesData = (params) => useList(["leaves", params], () => api.fetchLeavesData(params));
export const usePayrollData = (month) => useList(["payroll", month], () => api.fetchPayrollData(month));
export const useIncentivesData = (month) => useList(["incentives", month], () => api.fetchIncentivesData(month));
export const useIncrementsData = (params) => useList(["increments", params], () => api.fetchIncrementsData(params));
export const useIncrementGroupsData = (params) => useList(["increment-groups", params], () => api.fetchIncrementGroupsData(params));
export const useSalaryOverviewData = (params) => useList(["salary-overview", params], () => api.fetchSalaryOverviewData(params));
export const useSalaryHistoryData = (userId) => useList(["salary-history", userId], () => api.fetchSalaryHistoryData(userId), { enabled: Boolean(userId) });
export const useAdvancesData = (params) => useList(["advances", params], () => api.fetchAdvancesData(params));

// Money moves on salary and advance, so reports, balances and the dashboard refresh too
const useHrMutation = (mutationFn, success, also = []) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    meta: { success },
    onSuccess: () => [HR_KEY, ...also].forEach((queryKey) => queryClient.invalidateQueries({ queryKey: [queryKey] })),
  });
};
const MONEY = ["paymentMethods", "reports", "insights"];

export const useCheckIn = () => useHrMutation(api.checkIn, "Checked in.");
export const useCheckOut = () => useHrMutation(api.checkOut, "Checked out.");
export const useRequestLeave = () => useHrMutation(api.requestLeave, "Leave request sent.");
export const useCancelLeave = () => useHrMutation(api.cancelLeave, "Leave request cancelled.");
export const useMarkAttendance = () => useHrMutation(api.markAttendance, "Attendance saved.");
export const useAddLeave = () => useHrMutation(api.addLeave, "Leave added.");
export const useReviewLeave = () => useHrMutation(api.reviewLeave, (_, { status }) => `Leave ${status === "approved" || status === "rejected" ? status : "updated"}.`);
export const usePaySalary = () => useHrMutation(api.paySalary, "Salary paid.", MONEY);
export const useCreateIncrement = () => useHrMutation(api.createIncrement, (saved) => `Salary set to ${formatTaka(saved?.newSalary)}.`, ["staff"]);
export const useGiveAdvance = () => useHrMutation(api.giveAdvance, "Advance given.", MONEY);
