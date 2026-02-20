const Shimmer = ({ className = "" }) => (
  <div className={`relative overflow-hidden rounded-lg bg-muted/60 dark:bg-slate-800/60 ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent" />
  </div>
);

const TransactionLoading = () => {
  return (
    <div className="max-w-3xl mx-auto px-5 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Page title */}
      <Shimmer className="h-12 w-64" />

      {/* Scanner button placeholder */}
      <Shimmer className="h-12 w-full rounded-xl" />

      {/* Form fields */}
      <div className="space-y-5">
        {/* Type */}
        <div className="space-y-1.5">
          <Shimmer className="h-4 w-12" />
          <Shimmer className="h-10 w-full rounded-md" />
        </div>

        {/* Amount + Account */}
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <Shimmer className="h-4 w-16" />
            <Shimmer className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-1.5">
            <Shimmer className="h-4 w-16" />
            <Shimmer className="h-10 w-full rounded-md" />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <Shimmer className="h-4 w-16" />
          <Shimmer className="h-10 w-full rounded-md" />
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <Shimmer className="h-4 w-10" />
          <Shimmer className="h-10 w-full rounded-md" />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Shimmer className="h-4 w-24" />
          <Shimmer className="h-10 w-full rounded-md" />
        </div>

        {/* Recurring toggle */}
        <div className="rounded-lg border border-border/50 dark:border-slate-700/50 p-4 flex items-center justify-between">
          <div className="space-y-1.5">
            <Shimmer className="h-4 w-40" />
            <Shimmer className="h-3.5 w-64" />
          </div>
          <Shimmer className="h-6 w-11 rounded-full" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Shimmer className="h-11 flex-1 rounded-lg" />
        <Shimmer className="h-11 flex-1 rounded-lg" />
      </div>
    </div>
  );
};

export default TransactionLoading;
