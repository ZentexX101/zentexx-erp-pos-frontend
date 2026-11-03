import { useState } from "react";
import AnalyticsHeader from "../../components/analytics/AnalyticsHeader";
import AnalyticsSkeleton from "../../components/analytics/AnalyticsSkeleton";
import BranchComparisonCard from "../../components/analytics/BranchComparisonCard";
import BusinessPanel from "../../components/analytics/BusinessPanel";
import CustomerDuesCard from "../../components/analytics/CustomerDuesCard";
import ExpenseCategoryCard from "../../components/analytics/ExpenseCategoryCard";
import LowStockCard from "../../components/analytics/LowStockCard";
import MoneyFlowPanel from "../../components/analytics/MoneyFlowPanel";
import PaymentMethodsCard from "../../components/analytics/PaymentMethodsCard";
import RecentPurchasesCard from "../../components/analytics/RecentPurchasesCard";
import RecentSalesCard from "../../components/analytics/RecentSalesCard";
import SalesByCategoryCard from "../../components/analytics/SalesByCategoryCard";
import SalesDetailsPanel from "../../components/analytics/SalesDetailsPanel";
import SalesHeroCards from "../../components/analytics/SalesHeroCards";
import SalesTrendCard from "../../components/analytics/SalesTrendCard";
import StaffSalesCard from "../../components/analytics/StaffSalesCard";
import StockPanel from "../../components/analytics/StockPanel";
import TopProductsCard from "../../components/analytics/TopProductsCard";
import Alert from "../../components/common/alerts/Alert";
import { isMainAdmin } from "../../constants/roles";
import { useAnalyticsOverviewData, useRefreshAnalytics } from "../../hooks/useAnalyticsApi";
import { useAuth } from "../../hooks/useAuth";
import { useBranch } from "../../hooks/useBranch";
import { useBranchNamesData } from "../../hooks/useBranchApi";
import { hasPermission } from "../../utils/access";
import { PERIOD_OPTIONS, periodRange } from "../../utils/period";

// The dashboard. scope "main": the whole business, with a branch filter and branch comparison.
// scope "branch": the branch being worked in. One API call feeds every section; each section
// gets only the slice of data it shows.
const Analytics = ({ scope = "main" }) => {
  const { user } = useAuth();
  const { activeBranch } = useBranch();
  const inBranch = scope === "branch";
  const mainAdmin = isMainAdmin(user);
  const canView = hasPermission(user, "dashboard.view");

  // all states
  const [period, setPeriod] = useState({ period: "this_month", from: "", to: "" });
  const [branchFilter, setBranchFilter] = useState("");

  // call analytics api (everything is worked out on the backend, cached for a minute)
  const branch = inBranch ? activeBranch?._id : branchFilter;
  const params = { branch: mainAdmin ? branch : undefined, ...periodRange(period.period, period) };
  const { data, isLoading, isFetching, error, dataUpdatedAt } = useAnalyticsOverviewData(params, { enabled: canView });
  const refresh = useRefreshAnalytics(params);
  const { data: branches = [] } = useBranchNamesData();

  const periodLabel = period.period === "custom" ? "Custom range" : PERIOD_OPTIONS.find((o) => o.value === period.period)?.label;
  const subtitle = inBranch ? `Here is how ${activeBranch?.name ?? "this branch"} is doing` : "Here is how the whole business is doing";
  const showBranch = !branch; // all-branch view: lists say which branch each row is from

  if (!canView) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Welcome, {user.name}</h1>
        <p className="text-sm text-slate-500">Ask an admin for the Dashboard permission to see the analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <AnalyticsHeader
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
        <AnalyticsSkeleton />
      ) : (
        data && (
          <>
            {/* Headline numbers */}
            <SalesHeroCards
              sales={data.sales}
              purchases={data.purchases}
              expenses={data.expenses}
              profit={data.profit}
              trend={data.charts.trend}
              inBranch={inBranch}
              showMoney={mainAdmin}
              periodLabel={periodLabel}
            />

            {/* Details */}
            <div className="grid gap-4 xl:grid-cols-2">
              <SalesDetailsPanel sales={data.sales} exchanges={data.exchanges} saleReturns={data.saleReturns} inBranch={inBranch} periodLabel={periodLabel} />
              <MoneyFlowPanel
                cash={data.cash}
                purchases={data.purchases}
                purchaseReturns={data.purchaseReturns}
                payments={data.payments}
                inBranch={inBranch}
                periodLabel={periodLabel}
              />
              <StockPanel
                stock={data.stock}
                transfers={data.transfers}
                productCount={data.counts.products}
                inBranch={inBranch}
                showMoney={mainAdmin}
                periodLabel={periodLabel}
              />
              <BusinessPanel dues={data.dues} counts={data.counts} inBranch={inBranch} />
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
              <RecentSalesCard sales={data.recent.recentSales} inBranch={inBranch} showBranch={showBranch} />
              <RecentPurchasesCard purchases={data.recent.recentPurchases} inBranch={inBranch} showBranch={showBranch} />
              <CustomerDuesCard customers={data.recent.customerDues} inBranch={inBranch} />
              <LowStockCard rows={data.recent.lowStockRows} inBranch={inBranch} showBranch={showBranch} />
            </div>
          </>
        )
      )}
    </div>
  );
};

export default Analytics;
