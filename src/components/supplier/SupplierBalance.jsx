import { formatTaka } from "../../utils/money";
import { supplierBalanceMeaning } from "../../utils/supplier";

const toneClass = (amount) => (amount > 0 ? "text-green-600" : amount < 0 ? "text-red-600" : "text-slate-500");

// A supplier balance in its colour: green = we pay, red = we receive.
//   signed:      show "-" for negative amounts (lists); otherwise the colour alone tells the side
//   showMeaning: add the Bangla meaning after the amount
const SupplierBalance = ({ amount = 0, signed = false, showMeaning = false, className = "" }) => (
  <span className={`font-semibold ${toneClass(amount)} ${className}`}>
    {formatTaka(amount, { sign: signed })}
    {showMeaning && <span className="ml-1.5 text-xs font-medium">({supplierBalanceMeaning(amount)})</span>}
  </span>
);

export default SupplierBalance;
