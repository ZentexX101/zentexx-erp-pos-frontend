import { VARIANT_FIELDS } from "../../utils/productVariant";

const VARIANT_LABELS = {
  color: "Color",
  ram: "RAM",
  storage: "ROM",
  region: "Region",
};

// The product's variant as small chips: "RAM 12GB" "ROM 256GB" "Color Silver"
const VariantChips = ({ variant }) => {
  const fields = VARIANT_FIELDS.filter((field) => variant?.[field]);
  if (!fields.length) return null;
  return (
    <span className="flex flex-wrap gap-1">
      {fields.map((field) => (
        <span
          key={field}
          className="rounded bg-white px-1.5 py-0.5 text-[11px] text-slate-600 ring-1 ring-inset ring-slate-200"
        >
          <span className="text-slate-400">{VARIANT_LABELS[field]}</span>{" "}
          {variant[field]}
        </span>
      ))}
    </span>
  );
};

export default VariantChips;
