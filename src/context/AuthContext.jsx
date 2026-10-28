import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { setSessionExpiredHandler } from "../services/ApiRequestHandler";
import { fetchMeData, loginUser, logoutAllDevices, logoutUser } from "../providers/apiProviders/authApiProvider";
import { tokenStorage } from "../services/tokenStorage";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  // true until we know whether saved tokens still belong to a valid session
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSessionExpiredHandler(() => setUser(null));

    if (!tokenStorage.hasTokens()) {
      setLoading(false);
      return;
    }

    fetchMeData()
      .then(setUser)
      .catch(() => tokenStorage.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async ({ identifier, password, rememberMe }) => {
    const data = await loginUser({ identifier, password, rememberMe });
    tokenStorage.setTokens(data, rememberMe);
    setUser(data.user);
    return data.user;
  }, []);

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
    [queryClient]
  );

  const logout = useCallback(() => endSession(logoutUser), [endSession]);
  const logoutAll = useCallback(() => endSession(logoutAllDevices), [endSession]);

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), login, logout, logoutAll }),
    [user, loading, login, logout, logoutAll]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
