import { PERIOD_OPTIONS, periodRange } from "../../../utils/period";
import PeriodPicker from "./PeriodPicker";

const PRESETS = PERIOD_OPTIONS.filter((option) => option.value !== "custom");

// The quick period these dates are, or "custom" ("" / "" is "All time")
const periodOf = ({ from, to }) =>
  PRESETS.find((option) => {
    const range = periodRange(option.value);
    return range.from === from && range.to === to;
  })?.value ?? "custom";

// The period picker for pages that keep plain dates.
// value: { from, to } as YYYY-MM-DD ("" = no limit); onChange({ from, to })
const DateRangeFilter = ({ value, onChange, className = "sm:w-80" }) => {
  const range = { from: value.from || "", to: value.to || "" };
  return (
    <PeriodPicker
      value={{ period: periodOf(range), ...range }}
      range={range}
      onChange={(next) => onChange(periodRange(next.period, next))}
      className={className}
    />
  );
};

export default DateRangeFilter;
