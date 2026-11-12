import { lazy, Suspense } from "react";
import InsightsSkeleton from "../../components/insights/InsightsSkeleton";

// The charts library is big, so the dashboard loads in its own chunk on first visit.
// Meanwhile the same skeleton as while its data loads, so it reads as one smooth load.
const Insights = lazy(() => import("./Insights"));

const LazyInsights = ({ scope }) => (
  <Suspense fallback={<InsightsSkeleton />}>
    <Insights scope={scope} />
  </Suspense>
);

export default LazyInsights;
