const Shimmer = ({ className = "" }) => (
  <div className={`relative overflow-hidden rounded-lg bg-muted/60 dark:bg-slate-800/60 ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent" />
  </div>
);

const AccountLoading = () => {
  return (
    <div className="space-y-8 px-5 py-6 animate-in fade-in duration-300">
      {/* Account header */}
      <div className="flex gap-4 items-end justify-between">
        <div className="space-y-2">
          <Shimmer className="h-10 w-48 sm:w-64" />
          <Shimmer className="h-4 w-24" />
        </div>
        <div className="text-right space-y-2">
          <Shimmer className="h-7 w-28 ml-auto" />
          <Shimmer className="h-4 w-24 ml-auto" />
        </div>
      </div>

      {/* Chart skeleton */}
      <div className="rounded-xl border border-border/50 dark:border-slate-700/50 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <Shimmer className="h-5 w-36" />
          <Shimmer className="h-8 w-28 rounded-md" />
        </div>
        <Shimmer className="h-[220px] w-full rounded-lg" />
      </div>

      {/* Transaction table skeleton */}
      <div className="rounded-xl border border-border/50 dark:border-slate-700/50 overflow-hidden">
        <div className="p-4 border-b border-border/30 flex gap-3">
          <Shimmer className="h-9 flex-1" />
          <Shimmer className="h-9 w-32" />
        </div>
        <div className="divide-y divide-border/30">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Shimmer className="h-4 w-4 rounded" />
              <Shimmer className="h-4 w-24" />
              <Shimmer className="h-4 w-32 flex-1" />
              <Shimmer className="h-5 w-20 rounded-full" />
              <Shimmer className="h-4 w-16 ml-auto" />
              <Shimmer className="h-6 w-6 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountLoading;
