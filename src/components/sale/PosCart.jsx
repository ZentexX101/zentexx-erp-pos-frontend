import { LuPlus, LuShoppingCart } from "react-icons/lu";
import { externalQuantity } from "../../utils/externalProduct";
import { cartLineQuantity } from "../../utils/sale";
import PosCartLine from "./PosCartLine";
import PosExternalLine from "./PosExternalLine";

// The cart: one block per product (IMEIs or quantity, selling price, services sold with it, line total).
// onChange(index, field, value), onRemove(index). serviceOptions: active services for "Add service";
// onCreateService(index) (only for users who may create services) opens the new-service form for that line.
// externals: products brought in from elsewhere (not in stock), added / edited in a modal
// (onAddExternal, onEditExternal(index), onRemoveExternal(index)).
const PosCart = ({ lines, onChange, onRemove, externals = [], onAddExternal, onEditExternal, onRemoveExternal, serviceOptions = [], onCreateService }) => {
  const products = lines.length + externals.length;
  const pieces = lines.reduce((sum, line) => sum + cartLineQuantity(line), 0) + externals.reduce((sum, line) => sum + externalQuantity(line), 0);

  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <LuShoppingCart className="size-4 text-slate-500" aria-hidden="true" />
          Cart
        </p>
        {products > 0 && (
          <p className="text-xs text-slate-500">
            {products} {products === 1 ? "product" : "products"} · {pieces} pcs
          </p>
        )}
      </div>

      {products === 0 ? (
        <div className="px-4 py-10 text-center">
          <p className="text-sm font-medium text-slate-600">No products added yet</p>
          <p className="mx-auto mt-1 max-w-xs text-xs text-slate-500">
            Click a product or scan an IMEI to begin. Click it again to take it out. Not in stock? Add it as an external product.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {lines.map((line, index) => (
            <PosCartLine
              key={line.stock.product._id}
              line={line}
              serviceOptions={serviceOptions}
              onChange={(field, value) => onChange(index, field, value)}
              onRemove={() => onRemove(index)}
              onCreateService={onCreateService && (() => onCreateService(index))}
            />
          ))}
          {externals.map((line, index) => (
            <PosExternalLine key={line.key} line={line} onEdit={() => onEditExternal(index)} onRemove={() => onRemoveExternal(index)} />
          ))}
        </ul>
      )}

      {onAddExternal && (
        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={onAddExternal}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-amber-300 bg-amber-50/50 px-3 py-2.5 text-sm font-semibold text-amber-800 transition hover:border-amber-400 hover:bg-amber-50"
          >
            <LuPlus className="size-4" aria-hidden="true" />
            External product (not in stock)
          </button>
        </div>
      )}
    </section>
  );
};

export default PosCart;
