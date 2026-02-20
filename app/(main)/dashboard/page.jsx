import { getUserAccounts, getDashboardData } from '@/actions/dashboard';
import CreateAccountDrawer from '@/components/create-account-drawer';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import React, { Suspense } from 'react';
import AccountCard from './_components/account-card';
import { getCurrentBudget } from '@/actions/budget';
import BudgetProgress from './_components/budget-progress';
import DashboardOverview from './_components/transactions-overview';
import { checkUser } from '@/lib/checkUser';
import { ProfileUpdateForm } from '@/components/profile-update-form';

// ──────────────────────────────────────────────
// Shimmer helper (inline so no import needed)
// ──────────────────────────────────────────────
const Shimmer = ({ className = "" }) => (
  <div className={`relative overflow-hidden rounded-lg bg-muted/60 dark:bg-slate-800/60 ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent" />
  </div>
);

// Shimmer placeholder matching the BudgetProgress card shape
const BudgetSkeleton = () => (
  <div className="rounded-xl border border-border/50 dark:border-slate-700/50 p-5 space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Shimmer className="h-8 w-8 rounded-lg" />
        <div className="space-y-1"><Shimmer className="h-4 w-32" /><Shimmer className="h-3 w-20" /></div>
      </div>
      <Shimmer className="h-7 w-7 rounded-lg" />
    </div>
    <div className="flex justify-between">
      <Shimmer className="h-8 w-24" />
      <Shimmer className="h-8 w-20" />
    </div>
    <Shimmer className="h-3 w-full rounded-full" />
  </div>
);

// Shimmer placeholder matching the 2-col overview grid
const OverviewSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2">
    <div className="rounded-xl border border-border/50 dark:border-slate-700/50 p-5 space-y-3">
      <div className="flex justify-between"><Shimmer className="h-5 w-36" /><Shimmer className="h-7 w-24 rounded-lg" /></div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between py-1">
          <div className="space-y-1"><Shimmer className="h-4 w-40" /><Shimmer className="h-3 w-24" /></div>
          <Shimmer className="h-4 w-16" />
        </div>
      ))}
    </div>
    <div className="rounded-xl border border-border/50 dark:border-slate-700/50 p-5 space-y-3">
      <Shimmer className="h-5 w-44" />
      <Shimmer className="h-[170px] w-full rounded-xl" />
      <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="flex justify-between"><Shimmer className="h-3 w-32" /><Shimmer className="h-3 w-14" /></div>)}</div>
    </div>
  </div>
);

// ──────────────────────────────────────────────
// Independently suspended sections
// ──────────────────────────────────────────────
async function BudgetSection({ defaultAccount }) {
  if (!defaultAccount) return null;
  const budgetData = await getCurrentBudget(defaultAccount.id);
  return (
    <BudgetProgress
      initialBudget={budgetData?.budget}
      currentExpenses={budgetData?.currentExpenses || 0}
    />
  );
}

async function OverviewSection({ accounts }) {
  const transactions = await getDashboardData(20);
  return <DashboardOverview accounts={accounts} transactions={transactions || []} />;
}

// ──────────────────────────────────────────────
// Dashboard page
// ──────────────────────────────────────────────
const DashboardPage = async () => {
  const user = await checkUser();
  const accounts = await getUserAccounts();
  const defaultAccount = accounts?.find((a) => a.isDefault);

  return (
    <div className="px-4 sm:px-6 pt-4 pb-12 space-y-8 max-w-7xl mx-auto">
      {/* Personalized Greeting */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground dark:text-white flex items-center gap-2">
          Good {
            new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'
          }, {user?.name?.split(' ')[0] || 'there'} 
          <span className="text-2xl animate-bounce origin-bottom">👋</span>
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Here is your financial overview for today.
        </p>
      </div>

      {/* Profile update alert (only shown when needed by the component internally) */}
      <ProfileUpdateForm userData={user} />

      {/* Budget card */}
      <Suspense fallback={<BudgetSkeleton />}>
        <BudgetSection defaultAccount={defaultAccount} />
      </Suspense>

      {/* Overview: recent transactions + expense donut */}
      <Suspense fallback={<OverviewSkeleton />}>
        <OverviewSection accounts={accounts} />
      </Suspense>

      {/* Accounts grid */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Your Accounts</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Add New Account card */}
          <CreateAccountDrawer>
            <div className="group relative rounded-2xl border-2 border-dashed border-border/60 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 cursor-pointer h-full min-h-[140px] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex flex-col items-center gap-2 text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
                <div className="flex items-center justify-center h-10 w-10 rounded-full border-2 border-dashed border-current group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                  <Plus className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                </div>
                <p className="text-sm font-medium">Add New Account</p>
              </div>
            </div>
          </CreateAccountDrawer>

          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;