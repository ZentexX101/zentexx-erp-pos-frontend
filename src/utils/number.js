// Keeps only digits and one decimal point, for taka / percent inputs ("1,20a0.5.0" -> "1200.50")
export const toDecimalInput = (value) => value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");

// Keeps only digits, for quantity inputs
export const toIntegerInput = (value) => value.replace(/\D/g, "");

// Rounds to paisa, like the backend
export const roundTaka = (amount) => Math.round(amount * 100) / 100;
