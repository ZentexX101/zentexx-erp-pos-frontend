import { periodRange } from "../../../utils/period";
import PeriodPicker from "./PeriodPicker";

// List filter for a period: quick periods + a calendar for a custom range (same picker as the dashboard).
// value: { period, from, to }; onChange(next value). Turn it into dates with utils/period periodRange.
const PeriodFilter = ({ value, onChange, className = "sm:w-80" }) => (
  <PeriodPicker value={value} range={periodRange(value.period, value)} onChange={onChange} className={className} />
);

export default PeriodFilter;
