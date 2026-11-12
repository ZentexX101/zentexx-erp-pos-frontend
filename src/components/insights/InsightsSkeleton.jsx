const Block = ({ className }) => <div className={`animate-pulse rounded-2xl bg-slate-200/60 ${className}`} />;

// Placeholder in the dashboard's shape while the first load runs, so nothing jumps when it arrives
const InsightsSkeleton = () => (
  <div className="space-y-5" aria-busy="true" aria-label="Loading insights">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <Block key={i} className="h-44" />
      ))}
    </div>
    <div className="grid gap-4 xl:grid-cols-2">
      <Block className="h-56" />
      <Block className="h-56" />
    </div>
    <div className="grid gap-4 xl:grid-cols-[3fr_2fr]">
      <Block className="h-96" />
      <Block className="h-96" />
    </div>
  </div>
);

export default InsightsSkeleton;
