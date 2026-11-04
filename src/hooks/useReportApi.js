import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router";
import { isMainAdmin } from "../constants/roles";
import { fetchDailyStatementData, fetchProfitLossData } from "../providers/apiProviders/reportApiProvider";
import { useAuth } from "./useAuth";
import { useBranch } from "./useBranch";
import { useBranchNamesData } from "./useBranchApi";

const REPORT_KEY = "reports";

// ✅ Money in and out for a period — params: { branch, from, to }
export const useDailyStatementData = (params) => {
  return useQuery({
    queryKey: [REPORT_KEY, "daily", params],
    queryFn: () => fetchDailyStatementData(params),
    staleTime: 0, // a report always reloads when opened: it must include the sale just made
    placeholderData: keepPreviousData,
  });
};

// ✅ Profit & loss for a period — params: { branch, from, to }
export const useProfitLossData = (params) => {
  return useQuery({
    queryKey: [REPORT_KEY, "profit", params],
    queryFn: () => fetchProfitLossData(params),
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
};

// Which branch a report is about. The same pages serve both panels: inside a branch it's that branch;
// on the main panel a main admin picks one or sees all of them; anyone else is locked to their own by the API.
export const useReportScope = () => {
  const { user } = useAuth();
  const { activeBranch } = useBranch();
  const inBranch = useLocation().pathname.startsWith("/branch");
  const mainAdmin = isMainAdmin(user);
  const [branchFilter, setBranchFilter] = useState("");
  const { data: branches = [] } = useBranchNamesData();

  const branchId = inBranch ? activeBranch?._id : branchFilter;
  const picked = branches.find((b) => b._id === branchFilter);

  return {
    inBranch,
    branch: mainAdmin ? branchId : undefined, // for the API
    branchFilter,
    setBranchFilter,
    branches: !inBranch && mainAdmin ? branches : null, // the picker, main panel only
    pickedBranch: picked,
    branchName: inBranch ? activeBranch?.name : (picked?.name ?? "All branches"),
    showBranch: !branchId && mainAdmin, // lists say which branch each row is from
  };
};
