import { LuCircleAlert, LuGlobe, LuStore, LuUndo2 } from "react-icons/lu";
import { Link } from "react-router";
import { ROUTES } from "../../constants/routes";
import { formatDate } from "../../utils/formatDate";
import { formatTaka } from "../../utils/money";

// What the IMEI lookup found for an old device:
// - in stock now: it can't be taken in
// - sold by us: the sale, a warning when another customer bought it, and (within the shop's set days)
//   a hint that a POS Return / Replacement may fit better
// - not ours: an outside device
// lookup: see exchange.service lookupDevice. customer: the exchange's customer. hint: { enabled, days }.
// branchId: the branch working now (Return / Replacement only work on its own sales).
const DeviceOriginCard = ({ lookup, customer, hint, branchId }) => {
  if (lookup.inStock) {
    return (
      <div className="flex gap-2.5 rounded-lg bg-red-50 p-3 text-xs text-red-800 ring-1 ring-red-200">
        <LuCircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>
          <span className="font-semibold">Already in stock</span> at {lookup.inStock.branch?.name ?? "a branch"} ({lookup.inStock.product?.name}). A
          device that's in stock can't be taken in again — check the IMEI.
        </p>
      </div>
    );
  }

  const { sale } = lookup;
  if (!sale) {
    return (
      <div className="flex items-center gap-2.5 rounded-lg bg-slate-100 px-3 py-2.5 text-xs text-slate-700 ring-1 ring-slate-200">
        <LuGlobe className="size-4 shrink-0 text-slate-500" aria-hidden="true" />
        <p>
          <span className="font-semibold">Outside device</span> — not sold by us. Pick its product below.
        </p>
      </div>
    );
  }

  const otherBuyer = customer && sale.customer && sale.customer._id !== customer._id;
  const recent = hint?.enabled && sale.daysAgo <= hint.days;
  const sameBranch = sale.branch?._id === branchId;
  const ago = sale.daysAgo === 0 ? "today" : `${sale.daysAgo} day${sale.daysAgo === 1 ? "" : "s"} ago`;

  return (
    <div className="space-y-2">
      <div className="flex gap-2.5 rounded-lg bg-blue-50 p-3 text-xs text-blue-900 ring-1 ring-blue-200">
        <LuStore className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden="true" />
        <div className="min-w-0 space-y-0.5">
          <p className="font-semibold">Sold by us — {sale.invoiceNo}</p>
          <p>
            {formatDate(sale.date)} ({ago}) · {sale.branch?.name} · {formatTaka(sale.unitPrice)}
          </p>
          <p>
            {sale.product?.name} · to {sale.customer ? sale.customer.name : "a walk-in customer"}
          </p>
        </div>
      </div>

      {otherBuyer && (
        <div className="flex gap-2.5 rounded-lg bg-amber-50 p-3 text-xs text-amber-900 ring-1 ring-amber-200">
          <LuCircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            We sold this device to <span className="font-semibold">{sale.customer.name}</span>, not {customer.name}. Make sure it really belongs to
            the person bringing it.
          </p>
        </div>
      )}

      {recent && (
        <div className="flex gap-2.5 rounded-lg bg-amber-50 p-3 text-xs text-amber-900 ring-1 ring-amber-200">
          <LuUndo2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            <p>
              Sold only {ago}. If the customer wants their money back or the same model again, a <span className="font-semibold">POS Return</span>{" "}
              or <span className="font-semibold">Replacement</span> may fit better than an exchange.
            </p>
            {sameBranch ? (
              <p className="flex flex-wrap gap-x-3 gap-y-1 font-semibold">
                <Link to={`${ROUTES.BRANCH_POS_RETURN}?q=${encodeURIComponent(sale.invoiceNo)}`} className="text-indigo-700 underline">
                  Open POS Return
                </Link>
                <Link to={`${ROUTES.BRANCH_REPLACEMENT_NEW}?q=${encodeURIComponent(lookup.serial)}`} className="text-indigo-700 underline">
                  Open Replacement
                </Link>
              </p>
            ) : (
              <p>It was sold at {sale.branch?.name}, so a return or replacement is done from that branch.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceOriginCard;
