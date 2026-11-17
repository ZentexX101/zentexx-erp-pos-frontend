import { BUSINESS_NAME } from "../constants/app";

// The business name from Settings > Shop. The last one seen is kept in localStorage, so the loading screen
// and the first paint already show it; plain functions (PDF export) read it with getBusinessName().
const STORAGE_KEY = "zentexx.businessName";

let current = null;

export const getBusinessName = () => {
  if (current) return current;
  try {
    current = localStorage.getItem(STORAGE_KEY) || null;
  } catch {
    // blocked storage: fall back to the default below
  }
  return current || BUSINESS_NAME;
};

export const setBusinessName = (name) => {
  if (!name) return;
  current = name;
  document.title = name;
  try {
    localStorage.setItem(STORAGE_KEY, name);
  } catch {
    // not remembered for the next visit; fine
  }
};

// "Zentexx Electronics" -> { main: "Zentexx", rest: "Electronics" }
export const splitBusinessName = (name) => {
  const [main, ...rest] = name.trim().split(/\s+/);
  return { main, rest: rest.join(" ") };
};
