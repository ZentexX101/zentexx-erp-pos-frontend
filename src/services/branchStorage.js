// The branch a main admin has "logged in" to. sessionStorage, so each tab can work in its own branch.
const KEY = "zentexx_active_branch";

export const branchStorage = {
  getId: () => {
    try {
      return sessionStorage.getItem(KEY);
    } catch {
      return null;
    }
  },

  setId: (id) => {
    try {
      sessionStorage.setItem(KEY, id);
    } catch {
      // storage blocked — the branch is still kept in memory until reload
    }
  },

  clear: () => {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  },
};
