import { lazy, Suspense } from "react";
import AnalyticsSkeleton from "../../components/analytics/AnalyticsSkeleton";

// The charts library is big, so the dashboard loads in its own chunk on first visit.
// Meanwhile the same skeleton as while its data loads, so it reads as one smooth load.
const Analytics = lazy(() => import("./Analytics"));

const LazyAnalytics = ({ scope }) => (
  <Suspense fallback={<AnalyticsSkeleton />}>
    <Analytics scope={scope} />
  </Suspense>
);

export default LazyAnalytics;
