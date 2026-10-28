import { useCallback, useSyncExternalStore } from "react";

// true while the CSS media query matches, e.g. useMediaQuery("(min-width: 1024px)")
export const useMediaQuery = (query) => {
  const subscribe = useCallback(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    [query]
  );

  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches);
};
