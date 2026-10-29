import darkLogo from "../../../assets/decent-logo-dark.png";
import lightLogo from "../../../assets/decent-logo.png";
import { BUSINESS_NAME } from "../../../constants/app";

// Decent wordmark. tone="light" is the white logo for dark backgrounds, "dark" for light ones.
const BrandLogo = ({ tone = "dark", className = "h-9" }) => (
  <img src={tone === "light" ? lightLogo : darkLogo} alt={BUSINESS_NAME} className={`${className} w-auto select-none`} draggable="false" />
);

// Square "D" mark for tight spots (collapsed sidebar)
export const BrandMark = ({ className = "h-9 w-9 text-lg" }) => (
  <span
    aria-hidden="true"
    className={`flex shrink-0 items-center justify-center rounded-xl bg-slate-950 font-serif font-black text-white ${className}`}
  >
    D
  </span>
);

export default BrandLogo;
