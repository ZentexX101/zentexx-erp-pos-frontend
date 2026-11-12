// "1 order", "3 orders"
export const countLabel = (n, noun) => `${n} ${noun}${n === 1 ? "" : "s"}`;

// One measure of the trend as sparkline points
export const sparkOf = (trend, key) => trend.map((row) => ({ value: row[key] }));
