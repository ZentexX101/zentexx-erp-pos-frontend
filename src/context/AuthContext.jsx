import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import SwitchingOverlay from "../components/common/loaders/SwitchingOverlay";
import { setSessionExpiredHandler } from "../services/ApiRequestHandler";
import { fetchMeData, loginUser, logoutAllDevices, logoutUser } from "../providers/apiProviders/authApiProvider";
import { impersonateStaff } from "../providers/apiProviders/staffApiProvider";
import { branchStorage } from "../services/branchStorage";
import { adminStash, tokenStorage } from "../services/tokenStorage";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

// The switch screen stays at least this long, so it reads as a step and not a flicker
const MIN_SWITCH_MS = 900;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  // true until we know whether saved tokens still belong to a valid session
  const [loading, setLoading] = useState(true);
  // The main admin behind a "Login as" session ({ _id, name }), or null
  const [impersonator, setImpersonator] = useState(() => adminStash.get()?.admin ?? null);
  // { title } while "Login as" switches accounts, else null
  const [switching, setSwitching] = useState(null);

  // Runs an account switch behind the full-screen loader. The loader goes away a moment after the
  // switch, so the caller's navigation to the new home page happens underneath it.
  const withSwitchScreen = useCallback(async (title, task) => {
    setSwitching({ title });
    const started = Date.now();
    try {
      const result = await task();
      await wait(MIN_SWITCH_MS - (Date.now() - started));
      return result;
    } finally {
      setTimeout(() => setSwitching(null), 250);
    }
  }, []);

  // Ends a "Login as" session and puts the admin's own tokens back. Resolves to the admin, or null when
  // their own session has ended meanwhile (they then land on the login page).
  const restoreAdmin = useCallback(async () => {
    const stash = adminStash.get();
    try {
      await logoutUser();
    } catch {
      // the staff session may already be gone
    }
    adminStash.clear();
    branchStorage.clear();
    queryClient.clear();
    setImpersonator(null);
    if (!stash) {
      tokenStorage.clear();
      setUser(null);
      return null;
    }
    tokenStorage.setTokens(stash, stash.rememberMe);
    try {
      const admin = await fetchMeData();
      setUser(admin);
      return admin;
    } catch {
      tokenStorage.clear();
      setUser(null);
      return null;
    }
  }, [queryClient]);

  useEffect(() => {
    // A "Login as" session that runs out goes back to the admin instead of logging everyone out
    setSessionExpiredHandler(() => (adminStash.get() ? restoreAdmin() : setUser(null)));

    if (!tokenStorage.hasTokens()) {
      if (adminStash.get()) restoreAdmin().finally(() => setLoading(false));
      else setLoading(false);
      return;
    }

    fetchMeData()
      .then(setUser)
      .catch(() => tokenStorage.clear())
      .finally(() => setLoading(false));
  }, [restoreAdmin]);

  // "Back to Admin" from the top bar
  const returnToAdmin = useCallback(
    () => withSwitchScreen(`Switching back to ${impersonator?.name || "your account"}`, restoreAdmin),
    [withSwitchScreen, impersonator, restoreAdmin],
  );

  const login = useCallback(async ({ identifier, password, rememberMe }) => {
    const data = await loginUser({ identifier, password, rememberMe });
    adminStash.clear();
    setImpersonator(null);
    tokenStorage.setTokens(data, rememberMe);
    setUser(data.user);
    return data.user;
  }, []);

  // "Login as" a staff member from the staff list. Resolves to that staff member.
  const loginAs = useCallback(
    (staff) =>
      withSwitchScreen(`Switching to ${staff.name}`, async () => {
        const data = await impersonateStaff(staff._id);
        const admin = { _id: user._id, name: user.name };
        if (!adminStash.save(admin)) throw new Error("Couldn't keep your own login in this browser. Check that site storage is allowed.");
        tokenStorage.setTokens(data, false);
        branchStorage.clear();
        queryClient.clear(); // the staff view mustn't show the admin's cached data
        setImpersonator(admin);
        setUser(data.user);
        return data.user;
      }),
    [user, queryClient, withSwitchScreen],
  );

  const endSession = useCallback(
    async (request) => {
      try {
        await request();
      } catch {
        // still log out locally even if the server call fails
      } finally {
        tokenStorage.clear();
        queryClient.clear(); // the next user mustn't see this user's cached data
        setUser(null);
      }
    },
    [queryClient],
  );

  // Inside a "Login as" session, logging out means going back to the admin's own account
  const logout = useCallback(() => (impersonator ? returnToAdmin() : endSession(logoutUser)), [impersonator, returnToAdmin, endSession]);
  const logoutAll = useCallback(() => (impersonator ? returnToAdmin() : endSession(logoutAllDevices)), [impersonator, returnToAdmin, endSession]);

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), impersonator, login, loginAs, returnToAdmin, logout, logoutAll }),
    [user, loading, impersonator, login, loginAs, returnToAdmin, logout, logoutAll],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {switching && <SwitchingOverlay title={switching.title} />}
    </AuthContext.Provider>
  );
};
