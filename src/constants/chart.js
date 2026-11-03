// Chart colours, validated for colour-blind separation (dataviz palette, light surface).
// Each measure keeps one colour on every chart, so "Sales" is always blue.
export const SERIES_COLORS = {
  sales: "#2a78d6",
  purchases: "#eb6834",
  expenses: "#1baf7a",
  profit: "#eda100",
};

// Category slices in fixed order (never cycled); "Others" is always neutral grey
export const CATEGORICAL = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300"];
export const OTHERS_COLOR = "#b0aea5";

// Recessive chart chrome
export const GRID_COLOR = "#e2e8f0";
export const AXIS_COLOR = "#64748b";

// Calm icon tints for the stat tiles (not the series colours)
export const TILE_TINTS = {
  blue: "#2563eb",
  green: "#16a34a",
  red: "#dc2626",
  amber: "#d97706",
  purple: "#7c3aed",
  teal: "#0d9488",
  slate: "#64748b",
  pink: "#db2777",
};
