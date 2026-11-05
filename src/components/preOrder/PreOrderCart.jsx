import { LuTrash2 } from "react-icons/lu";
import { formatTaka } from "../../utils/money";
import { toDecimalInput, toIntegerInput } from "../../utils/number";
import { cartLineTotal } from "../../utils/preOrder";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-brand/10";

// The booked products: price and how many for each. Each line stacks on a phone, so nothing has to scroll sideways.
const PreOrderCart = ({ lines, onChange }) => {
  const setLine = (id, field, value) => onChange(lines.map((line) => (line.product._id === id ? { ...line, [field]: value } : line)));

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
      <div className="hidden grid-cols-[minmax(0,1fr)_6.5rem_4rem_6.5rem_2rem] gap-2 bg-slate-50/70 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid">
        <span>Product</span>
        <span>Price</span>
        <span>Qty</span>
        <span className="text-right">Total</span>
        <span />
      </div>
      {lines.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-slate-500">
          No products yet.
          <span className="block text-xs">Click a product to add it to this pre order.</span>
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {lines.map((line) => (
            <li
              key={line.product._id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_6.5rem_4rem_6.5rem_2rem]"
            >
              <span className="col-span-1 min-w-0 text-sm font-medium uppercase text-slate-900" title={line.product.name}>
                <span className="line-clamp-2 [overflow-wrap:anywhere]">{line.product.name}</span>
              </span>
              <button
                type="button"
                onClick={() => onChange(lines.filter((item) => item.product._id !== line.product._id))}
                aria-label={`Remove ${line.product.name}`}
                className="justify-self-end rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 sm:order-last"
              >
                <LuTrash2 className="size-4" aria-hidden="true" />
              </button>
              <div className="col-span-2 grid grid-cols-[minmax(0,1fr)_4rem_minmax(0,1fr)] items-center gap-2 sm:col-span-3 sm:grid-cols-[6.5rem_4rem_6.5rem]">
                <input
                  inputMode="decimal"
                  aria-label={`Price of ${line.product.name}`}
                  placeholder="Price"
                  value={line.unitPrice}
                  onChange={(e) => setLine(line.product._id, "unitPrice", toDecimalInput(e.target.value))}
                  className={inputClass}
                />
                <input
                  inputMode="numeric"
                  aria-label={`How many ${line.product.name}`}
                  value={line.quantity}
                  onChange={(e) => setLine(line.product._id, "quantity", toIntegerInput(e.target.value))}
                  className={inputClass}
                />
                <span className="truncate text-right text-sm font-semibold tabular-nums text-slate-900">{formatTaka(cartLineTotal(line))}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default PreOrderCart;
