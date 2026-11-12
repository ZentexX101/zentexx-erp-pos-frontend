import { useState } from "react";
import InsightsHeader from "../../components/insights/InsightsHeader";
import InsightsSkeleton from "../../components/insights/InsightsSkeleton";
import BranchComparisonCard from "../../components/insights/BranchComparisonCard";
import BusinessPanel from "../../components/insights/BusinessPanel";
import CustomerDuesCard from "../../components/insights/CustomerDuesCard";
import ExpenseCategoryCard from "../../components/insights/ExpenseCategoryCard";
import LowStockCard from "../../components/insights/LowStockCard";
import MoneyFlowPanel from "../../components/insights/MoneyFlowPanel";
import PaymentMethodsCard from "../../components/insights/PaymentMethodsCard";
import RecentPurchasesCard from "../../components/insights/RecentPurchasesCard";
import RecentSalesCard from "../../components/insights/RecentSalesCard";
import SalesByCategoryCard from "../../components/insights/SalesByCategoryCard";
import SalesDetailsPanel from "../../components/insights/SalesDetailsPanel";
import SalesHeroCards from "../../components/insights/SalesHeroCards";
import SalesTrendCard from "../../components/insights/SalesTrendCard";
import StaffSalesCard from "../../components/insights/StaffSalesCard";
import StockPanel from "../../components/insights/StockPanel";
import TopProductsCard from "../../components/insights/TopProductsCard";
import Alert from "../../components/common/alerts/Alert";
import { isMainAdmin } from "../../constants/roles";
import { useInsightsOverviewData, useRefreshInsights } from "../../hooks/useInsightsApi";
import { useAuth } from "../../hooks/useAuth";
import { useBranch } from "../../hooks/useBranch";
import { useBranchNamesData } from "../../hooks/useBranchApi";
import { useCardLink } from "../../hooks/useCardLink";
import { hasPermission } from "../../utils/access";
import { PERIOD_OPTIONS, periodRange } from "../../utils/period";

// The dashboard. scope "main": the whole business, with a branch filter and branch comparison.
// scope "branch": the branch being worked in. One API call feeds every section; each section
// gets only the slice of data it shows.
const Insights = ({ scope = "main" }) => {
  const { user } = useAuth();
  const { activeBranch } = useBranch();
  const inBranch = scope === "branch";
  const mainAdmin = isMainAdmin(user);
  const canView = hasPermission(user, "dashboard.view");

  // all states
  const [period, setPeriod] = useState({ period: "this_month", from: "", to: "" });
  const [branchFilter, setBranchFilter] = useState("");

  // call insights api (everything is worked out on the backend, cached for a minute)
  const branch = inBranch ? activeBranch?._id : branchFilter;
  const params = { branch: mainAdmin ? branch : undefined, ...periodRange(period.period, period) };
  const { data, isLoading, isFetching, error, dataUpdatedAt } = useInsightsOverviewData(params, { enabled: canView });
  const refresh = useRefreshInsights(params);
  const { data: branches = [] } = useBranchNamesData();
  // where each card leads (a branch picked on the main dashboard opens that branch's pages)
  const linkTo = useCardLink({ inBranch, branch: branches.find((b) => b._id === branchFilter) });

  const periodLabel = period.period === "custom" ? "Custom range" : PERIOD_OPTIONS.find((o) => o.value === period.period)?.label;
  const subtitle = inBranch ? `Here is how ${activeBranch?.name ?? "this branch"} is doing` : "Here is how the whole business is doing";
  const showBranch = !branch; // all-branch view: lists say which branch each row is from

  if (!canView) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Welcome, {user.name}</h1>
        <p className="text-sm text-slate-500">Ask an admin for the Dashboard permission to see the insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <InsightsHeader
        user={user}
        subtitle={subtitle}
        period={period}
        range={params}
        onPeriod={setPeriod}
        branches={!inBranch && mainAdmin ? branches : null}
        branch={branchFilter}
        onBranch={setBranchFilter}
        onRefresh={refresh}
        refreshing={isFetching}
        updatedAt={dataUpdatedAt}
      />

      <Alert>{error?.message}</Alert>

      {isLoading && !data ? (
        <InsightsSkeleton />
      ) : (
        data && (
          <>
            {/* Headline numbers */}
            <SalesHeroCards
              sales={data.sales}
              salesNow={data.salesNow}
              purchases={data.purchases}
              expenses={data.expenses}
              trend={data.charts.trend}
              linkTo={linkTo}
              periodLabel={periodLabel}
            />

            {/* Details */}
            <div className="grid gap-4 xl:grid-cols-2">
              <SalesDetailsPanel
                sales={data.sales}
                exchanges={data.exchanges}
                saleReturns={data.saleReturns}
                serviceSales={data.serviceSales}
                repairs={data.repairs}
                linkTo={linkTo}
                periodLabel={periodLabel}
              />
              <MoneyFlowPanel
                preOrders={data.preOrders}
                cash={data.cash}
                purchases={data.purchases}
                purchaseReturns={data.purchaseReturns}
                payments={data.payments}
                linkTo={linkTo}
                periodLabel={periodLabel}
              />
              <StockPanel
                stock={data.stock}
                transfers={data.transfers}
                productCount={data.counts.products}
                linkTo={linkTo}
                showMoney={mainAdmin}
                periodLabel={periodLabel}
              />
              <BusinessPanel dues={data.dues} counts={data.counts} linkTo={linkTo} />
            </div>

            {/* Charts */}
            <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <SalesTrendCard trend={data.charts.trend} unit={data.scope.trendUnit} allTime={!data.scope.from} />
              <SalesByCategoryCard categories={data.charts.categories} />
            </div>

            {data.charts.branchComparison.length > 0 && <BranchComparisonCard rows={data.charts.branchComparison} />}

            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              <TopProductsCard products={data.charts.topProducts} showMoney={mainAdmin} />
              <PaymentMethodsCard methods={data.charts.paymentMix} />
              <ExpenseCategoryCard categories={data.charts.expenseByCategory} />
            </div>

            <StaffSalesCard staff={data.charts.topStaff} />

            {/* Latest activity and what needs attention */}
            <div className="grid gap-4 lg:grid-cols-2">
              <RecentSalesCard sales={data.recent.recentSales} linkTo={linkTo} showBranch={showBranch} />
              <RecentPurchasesCard purchases={data.recent.recentPurchases} linkTo={linkTo} showBranch={showBranch} />
              <CustomerDuesCard customers={data.recent.customerDues} linkTo={linkTo} />
              <LowStockCard rows={data.recent.lowStockRows} linkTo={linkTo} showBranch={showBranch} />
            </div>
          </>
        )
      )}
    </div>
  );
};

export default Insights;
