const Shimmer = ({ className = "" }) => (
  <div className={`relative overflow-hidden rounded-lg bg-muted/60 dark:bg-slate-800/60 ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent" />
  </div>
);

const DashboardLoading = () => {
  return (
    <div className="px-5 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Budget progress skeleton */}
      <div className="rounded-xl border border-border/50 dark:border-slate-700/50 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <Shimmer className="h-4 w-40" />
          <Shimmer className="h-4 w-16" />
        </div>
        <Shimmer className="h-2.5 w-full rounded-full" />
        <Shimmer className="h-3 w-24 ml-auto" />
      </div>

      {/* Overview grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border/50 dark:border-slate-700/50 p-5 space-y-4">
          <Shimmer className="h-5 w-44" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-1.5">
                <Shimmer className="h-3.5 w-32" />
                <Shimmer className="h-3 w-20" />
              </div>
              <Shimmer className="h-5 w-16" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border/50 dark:border-slate-700/50 p-5 space-y-4">
          <Shimmer className="h-5 w-52" />
          <Shimmer className="h-[220px] w-full rounded-lg" />
        </div>
      </div>

      {/* Account cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border/50 dark:border-slate-700/50 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <Shimmer className="h-4 w-24" />
              <Shimmer className="h-5 w-10 rounded-full" />
            </div>
            <Shimmer className="h-8 w-32" />
            <Shimmer className="h-3.5 w-20" />
            <div className="pt-2 border-t border-border/30 flex justify-between">
              <Shimmer className="h-3 w-14" />
              <Shimmer className="h-3 w-14" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardLoading;
