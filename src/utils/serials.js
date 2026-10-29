// IMEIs typed or scanned one per line (commas and spaces also separate them), trimmed and upper case
export const parseSerials = (text) =>
  text
    .split(/[\s,]+/)
    .map((serial) => serial.trim().toUpperCase())
    .filter(Boolean);

// Serials that appear more than once
export const repeatedSerials = (serials) => [...new Set(serials.filter((serial, i) => serials.indexOf(serial) !== i))];
