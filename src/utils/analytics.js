// "1 order", "3 orders"
export const countLabel = (n, noun) => `${n} ${noun}${n === 1 ? "" : "s"}`;

// A card's details page: the branch page inside a branch, the main-panel page (if any) outside one
export const pageFor = (inBranch, branchRoute, mainRoute) => (inBranch ? branchRoute : mainRoute);

// One measure of the trend as sparkline points
export const sparkOf = (trend, key) => trend.map((row) => ({ value: row[key] }));
