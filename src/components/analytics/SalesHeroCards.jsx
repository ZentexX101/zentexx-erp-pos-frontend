import { LuReceipt, LuShoppingBag, LuShoppingCart, LuTrendingDown, LuTrendingUp, LuWallet } from "react-icons/lu";
import { SERIES_COLORS } from "../../constants/chart";
import { countLabel, sparkOf } from "../../utils/analytics";
import { formatTaka, takaInWords } from "../../utils/money";
import HeroCard from "./ui/HeroCard";

// The four headline numbers with sparklines. showMoney: Net Profit (main admins); others see Collected.
// sales covers POS sales and exchanges together.
const SalesHeroCards = ({ sales, purchases, expenses, profit, trend, linkTo, showMoney, periodLabel }) => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <HeroCard
      icon={LuShoppingCart}
      label="Total Sales"
      link={linkTo("sales")}
      value={formatTaka(sales.total)}
      words={takaInWords(sales.total)}
      badge={countLabel(sales.count, "order")}
      hint={periodLabel}
      color={SERIES_COLORS.sales}
      glow="sales"
      spark={sparkOf(trend, "sales")}
    />
    {showMoney ? (
      <HeroCard
        icon={profit.net >= 0 ? LuTrendingUp : LuTrendingDown}
        label="Net Profit"
        value={formatTaka(profit.net)}
        words={takaInWords(profit.net)}
        valueClass={profit.net >= 0 ? "text-green-600" : "text-red-600"}
        hint={`Gross ${formatTaka(profit.gross)} − incentives − salaries − expenses`}
        color={SERIES_COLORS.profit}
        glow="profit"
        spark={sparkOf(trend, "profit")}
      />
    ) : (
      <HeroCard
        icon={LuWallet}
        label="Collected"
        link={linkTo("sales")}
        value={formatTaka(sales.paid)}
        words={takaInWords(sales.paid)}
        hint="Paid at billing"
        color={SERIES_COLORS.profit}
        glow="profit"
        spark={sparkOf(trend, "sales")}
      />
    )}
    <HeroCard
      icon={LuShoppingBag}
      label="Total Purchase"
      link={linkTo("purchases")}
      value={formatTaka(purchases.total)}
      words={takaInWords(purchases.total)}
      badge={countLabel(purchases.count, "invoice")}
      hint={periodLabel}
      color={SERIES_COLORS.purchases}
      glow="purchases"
      spark={sparkOf(trend, "purchases")}
    />
    <HeroCard
      icon={LuReceipt}
      label="Total Expense"
      link={linkTo("expenses")}
      value={formatTaka(expenses.total)}
      words={takaInWords(expenses.total)}
      badge={countLabel(expenses.count, "expense")}
      hint={periodLabel}
      color={SERIES_COLORS.expenses}
      glow="expenses"
      spark={sparkOf(trend, "expenses")}
    />
  </div>
);

export default SalesHeroCards;
