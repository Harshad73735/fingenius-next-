import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-slate-200/50 dark:border-slate-700/50 h-10 w-full min-w-0 rounded-lg border bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm px-3 py-1 text-base shadow-sm transition-all duration-300 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-purple-500/50 focus-visible:ring-4 focus-visible:ring-purple-500/20 hover:bg-white/80 dark:hover:bg-slate-800/50",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props} />
  );
}

export { Input }
