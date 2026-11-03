import { LuReceipt, LuShoppingBag, LuShoppingCart, LuTrendingDown, LuTrendingUp, LuWallet } from "react-icons/lu";
import { SERIES_COLORS } from "../../constants/chart";
import { ROUTES } from "../../constants/routes";
import { countLabel, pageFor, sparkOf } from "../../utils/analytics";
import { formatTaka } from "../../utils/money";
import HeroCard from "./ui/HeroCard";

// The four headline numbers with sparklines. showMoney: Net Profit (main admins); others see Collected.
// sales covers POS sales and exchanges together.
const SalesHeroCards = ({ sales, purchases, expenses, profit, trend, inBranch, showMoney, periodLabel }) => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <HeroCard
      icon={LuShoppingCart}
      label="Total Sales"
      value={formatTaka(sales.total)}
      hint={`${countLabel(sales.count, "order")} · ${periodLabel}`}
      color={SERIES_COLORS.sales}
      glow="sales"
      spark={sparkOf(trend, "sales")}
      to={pageFor(inBranch, ROUTES.BRANCH_SALES)}
    />
    {showMoney ? (
      <HeroCard
        icon={profit.net >= 0 ? LuTrendingUp : LuTrendingDown}
        label="Net Profit"
        value={formatTaka(profit.net)}
        valueClass={profit.net >= 0 ? "text-green-600" : "text-red-600"}
        hint={`Gross ${formatTaka(profit.gross)} − expenses`}
        color={SERIES_COLORS.profit}
        glow="profit"
        spark={sparkOf(trend, "profit")}
      />
    ) : (
      <HeroCard icon={LuWallet} label="Collected" value={formatTaka(sales.paid)} hint="Paid at billing" color={SERIES_COLORS.profit} glow="profit" spark={sparkOf(trend, "sales")} />
    )}
    <HeroCard
      icon={LuShoppingBag}
      label="Total Purchase"
      value={formatTaka(purchases.total)}
      hint={countLabel(purchases.count, "invoice")}
      color={SERIES_COLORS.purchases}
      glow="purchases"
      spark={sparkOf(trend, "purchases")}
      to={pageFor(inBranch, ROUTES.BRANCH_PURCHASES)}
    />
    <HeroCard
      icon={LuReceipt}
      label="Total Expense"
      value={formatTaka(expenses.total)}
      hint={countLabel(expenses.count, "expense")}
      color={SERIES_COLORS.expenses}
      glow="expenses"
      spark={sparkOf(trend, "expenses")}
      to={pageFor(inBranch, ROUTES.BRANCH_EXPENSES)}
    />
  </div>
);

export default SalesHeroCards;
