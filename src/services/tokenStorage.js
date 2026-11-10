// "Remember me" keeps tokens in localStorage (survives browser restart);
// otherwise sessionStorage, so closing the browser logs the user out.
const KEY = "zentexx_auth";

const safeGet = (storage, key = KEY) => {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const findStore = () => {
  if (safeGet(localStorage)) return localStorage;
  if (safeGet(sessionStorage)) return sessionStorage;
  return null;
};

export const tokenStorage = {
  getAccessToken: () => {
    const store = findStore();
    return store ? safeGet(store).accessToken : null;
  },

  getRefreshToken: () => {
    const store = findStore();
    return store ? safeGet(store).refreshToken : null;
  },

  hasTokens: () => Boolean(findStore()),

  // rememberMe is only passed on login; refreshes keep using the current storage
  setTokens: ({ accessToken, refreshToken }, rememberMe) => {
    const store =
      rememberMe === undefined ? findStore() || sessionStorage : rememberMe ? localStorage : sessionStorage;
    tokenStorage.clear();
    try {
      store.setItem(KEY, JSON.stringify({ accessToken, refreshToken }));
    } catch {
      // storage blocked (private mode etc.) — user stays logged in until reload
    }
  },

  clear: () => {
    try {
      localStorage.removeItem(KEY);
      sessionStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  },
};

// "Login as": the main admin's own tokens wait here while they use the app as a staff member.
// Kept in the same storage the admin's tokens were in, so "remember me" still holds when they come back.
const ADMIN_KEY = "zentexx_admin_auth";

export const adminStash = {
  // { accessToken, refreshToken, rememberMe, admin: { _id, name } } or null
  get: () => safeGet(localStorage, ADMIN_KEY) || safeGet(sessionStorage, ADMIN_KEY),

  // Moves the current tokens aside; returns false when there are none
  save: (admin) => {
    const store = findStore();
    if (!store) return false;
    try {
      store.setItem(ADMIN_KEY, JSON.stringify({ ...safeGet(store), rememberMe: store === localStorage, admin }));
      return true;
    } catch {
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.removeItem(ADMIN_KEY);
      sessionStorage.removeItem(ADMIN_KEY);
    } catch {
      // ignore
    }
  },
};
