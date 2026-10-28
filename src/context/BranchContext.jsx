import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { isMainAdmin } from "../constants/roles";
import { useAuth } from "../hooks/useAuth";
import { fetchCurrentBranchData } from "../providers/apiProviders/branchApiProvider";
import { branchStorage } from "../services/branchStorage";

// eslint-disable-next-line react-refresh/only-export-components
export const BranchContext = createContext(null);

// The branch the current user works in:
// - branch staff: always their own branch (user.branch)
// - main admin: the branch they "logged in" to from the branch list, or null in the main admin panel
export const BranchProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const mainAdmin = isMainAdmin(user);

  const [enteredBranch, setEnteredBranch] = useState(null);
  const [checking, setChecking] = useState(() => Boolean(branchStorage.getId()));

  useEffect(() => {
    if (authLoading) return;

    if (!mainAdmin) {
      branchStorage.clear();
      setEnteredBranch(null);
      setChecking(false);
      return;
    }

    // After a reload, re-fetch the stored branch (it may have been deleted meanwhile)
    if (branchStorage.getId() && !enteredBranch) {
      setChecking(true);
      fetchCurrentBranchData()
        .then(setEnteredBranch)
        .catch(() => branchStorage.clear())
        .finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, [authLoading, mainAdmin, enteredBranch]);

  const enterBranch = useCallback((branch) => {
    branchStorage.setId(branch._id);
    setEnteredBranch(branch);
  }, []);

  const exitBranch = useCallback(() => {
    branchStorage.clear();
    setEnteredBranch(null);
  }, []);

  const value = useMemo(
    () => ({
      activeBranch: mainAdmin ? enteredBranch : user?.branch || null,
      loading: authLoading || checking,
      enterBranch,
      exitBranch,
    }),
    [mainAdmin, enteredBranch, user, authLoading, checking, enterBranch, exitBranch]
  );

  return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>;
};
