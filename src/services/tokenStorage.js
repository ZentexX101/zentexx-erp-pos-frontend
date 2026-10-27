// "Remember me" keeps tokens in localStorage (survives browser restart);
// otherwise sessionStorage, so closing the browser logs the user out.
const KEY = "zentexx_auth";

const safeGet = (storage) => {
  try {
    const raw = storage.getItem(KEY);
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
