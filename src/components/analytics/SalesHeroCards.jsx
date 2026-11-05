import { LuReceipt, LuShoppingBag, LuShoppingCart } from "react-icons/lu";
import { SERIES_COLORS } from "../../constants/chart";
import { countLabel, sparkOf } from "../../utils/analytics";
import { formatTaka, takaInWords } from "../../utils/money";
import HeroCard from "./ui/HeroCard";
import SalesNowCard from "./ui/SalesNowCard";

// The headline cards. sales covers POS sales and exchanges together; salesNow is this month and today, whatever the period.
const SalesHeroCards = ({ sales, salesNow, purchases, expenses, trend, linkTo, periodLabel }) => (
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
    <SalesNowCard salesNow={salesNow} link={linkTo("sales")} />
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
