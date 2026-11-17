import { useBusinessName } from "../../../hooks/useSettingApi";
import { splitBusinessName } from "../../../utils/businessName";
import { getInitials } from "../../../utils/initials";

const SIZES = {
  sm: { main: "text-lg", rest: "text-[7px]" },
  md: { main: "text-[22px]", rest: "text-[8px]" },
  lg: { main: "text-3xl", rest: "text-[10px]" },
  xl: { main: "text-4xl", rest: "text-xs" },
};

// The business name (Settings > Shop) as a wordmark: the first word big, the rest small under it.
// tone="light" for dark backgrounds, "dark" for light ones. size: sm / md / lg / xl.
const BrandLogo = ({ tone = "dark", size = "md", className = "" }) => {
  const name = useBusinessName();
  const { main, rest } = splitBusinessName(name);
  const s = SIZES[size] ?? SIZES.md;
  const light = tone === "light";

  return (
    <span className={`inline-flex min-w-0 max-w-full select-none flex-col leading-none ${className}`} title={name}>
      <span className={`truncate font-serif font-black uppercase tracking-tight ${s.main} ${light ? "text-white" : "text-slate-950"}`}>{main}</span>
      {rest && (
        <span className={`mt-[3px] truncate font-semibold uppercase tracking-[0.18em] ${s.rest} ${light ? "text-white/60" : "text-slate-500"}`}>
          {rest}
        </span>
      )}
    </span>
  );
};

// Square mark with the name's initials, for tight spots (collapsed sidebar)
export const BrandMark = ({ className = "h-9 w-9 text-sm" }) => {
  const name = useBusinessName();
  return (
    <span
      aria-hidden="true"
      title={name}
      className={`flex shrink-0 items-center justify-center rounded-xl bg-slate-950 font-serif font-black text-white ${className}`}
    >
      {getInitials(name)}
    </span>
  );
};

export default BrandLogo;

// The business name as plain text (headings of invoices, slips, reports)
export const BusinessName = () => useBusinessName();
