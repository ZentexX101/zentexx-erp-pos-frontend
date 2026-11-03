import { lazy, Suspense } from "react";
import Spinner from "../../components/common/loaders/Spinner";

// The charts library is big, so the dashboard loads in its own chunk on first visit
const Analytics = lazy(() => import("./Analytics"));

const LazyAnalytics = ({ scope }) => (
  <Suspense
    fallback={
      <div className="flex justify-center py-20">
        <Spinner className="h-6 w-6 text-indigo-600" />
      </div>
    }
  >
    <Analytics scope={scope} />
  </Suspense>
);

export default LazyAnalytics;
