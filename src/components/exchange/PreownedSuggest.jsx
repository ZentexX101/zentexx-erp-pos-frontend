import { useState } from "react";
import { LuRecycle } from "react-icons/lu";
import { useCategoryOptionsData } from "../../hooks/useCategoryApi";
import { useMakePreownedProduct } from "../../hooks/useSaleApi";
import { isPreownedCategory } from "../../utils/exchange";
import Button from "../common/buttons/Button";
import Select from "../common/forms/Select";

// A used device shouldn't go into a new product's stock. Offers the "Preowned" listing of base:
// made once in the picked category (a "Preowned…" category is picked by default), then reused.
// onPicked(product) sets it on the device row.
const PreownedSuggest = ({ base, onPicked }) => {
  const { data: categories = [] } = useCategoryOptionsData();
  const make = useMakePreownedProduct();
  const [category, setCategory] = useState("");
  const picked = category || categories.find(isPreownedCategory)?._id || "";

  const handleMake = async () => {
    const product = await make.mutateAsync({ product: base._id, category: picked || null });
    onPicked(product);
  };

  return (
    <div className="space-y-2.5 rounded-lg bg-violet-50/70 p-3 ring-1 ring-violet-200">
      <p className="flex gap-2 text-xs text-violet-900">
        <LuRecycle className="mt-0.5 size-4 shrink-0 text-violet-600" aria-hidden="true" />
        <span>
          Used devices go into a <span className="font-semibold">Preowned</span> listing, so they don't mix with new &ldquo;{base.name}&rdquo; stock
          at the POS.
        </span>
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <Select
            label="Category for preowned"
            placeholder="Select a category"
            options={categories.map((c) => ({ value: c._id, label: c.name }))}
            value={picked}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <Button onClick={handleMake} loading={make.isPending} disabled={!picked} className="shrink-0">
          Use Preowned listing
        </Button>
      </div>
      {make.error && <p className="text-xs text-red-600">{make.error.message}</p>}
    </div>
  );
};

export default PreownedSuggest;
