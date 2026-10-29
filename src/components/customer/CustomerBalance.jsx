import { formatTaka } from "../../utils/money";
import { customerBalanceMeaning } from "../../utils/customer";

const toneClass = (amount) => (amount > 0 ? "text-red-600" : amount < 0 ? "text-green-600" : "text-slate-500");

// A customer balance in its colour: red = the customer pays us, green = we pay the customer.
//   signed:      show "-" for negative amounts (lists); otherwise the colour alone tells the side
//   showMeaning: add the Bangla meaning after the amount
const CustomerBalance = ({ amount = 0, signed = false, showMeaning = false, className = "" }) => (
  <span className={`font-semibold ${toneClass(amount)} ${className}`}>
    {formatTaka(amount, { sign: signed })}
    {showMeaning && <span className="ml-1.5 text-xs font-medium">({customerBalanceMeaning(amount)})</span>}
  </span>
);

export default CustomerBalance;
