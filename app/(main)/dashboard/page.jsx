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
import Greeting from './_components/greeting';

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
async function BudgetSection({ defaultAccount, userCurrency }) {
  if (!defaultAccount) return null;
  const budgetData = await getCurrentBudget(defaultAccount.id);
  return (
    <BudgetProgress
      initialBudget={budgetData?.budget}
      currentExpenses={budgetData?.currentExpenses || 0}
      userCurrency={userCurrency}
    />
  );
}

async function OverviewSection({ accounts, userCurrency }) {
  const transactions = await getDashboardData(20);
  return <DashboardOverview accounts={accounts} transactions={transactions || []} userCurrency={userCurrency} />;
}

// ──────────────────────────────────────────────
// Dashboard page
// ──────────────────────────────────────────────
const DashboardPage = async () => {
  const [user, accounts] = await Promise.all([
    checkUser(),
    getUserAccounts(),
  ]);
  const defaultAccount = accounts?.find((a) => a.isDefault);

  return (
    <div className="px-4 sm:px-6 pb-16 max-w-7xl mx-auto">

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <section className="relative rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 shadow-xl shadow-purple-500/5 p-6 sm:p-10 overflow-hidden">
        {/* Decorative gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-pink-50/60 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-pink-950/30 rounded-3xl" />
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-purple-400/15 dark:bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-blue-400/15 dark:bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

        {/* Hero content + Preferences in top-right */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-purple-600 dark:text-purple-400 tracking-widest uppercase">
              Dashboard Overview
            </p>
            <Greeting name={user?.name?.split(' ')[0]} />
            <p className="text-muted-foreground text-sm sm:text-base max-w-lg leading-relaxed mt-1">
              Here's what is happening with your finances today.
            </p>
          </div>

          {/* Preferences button – top-right of hero */}
          <div className="shrink-0">
            <ProfileUpdateForm userData={user} />
          </div>
        </div>
      </section>

      {/* ═══════════════ BUDGET ═══════════════ */}
      <section className="mt-8">
        <Suspense fallback={<BudgetSkeleton />}>
          <BudgetSection defaultAccount={defaultAccount} userCurrency={user?.currency} />
        </Suspense>
      </section>

      {/* ═══════════════ TRANSACTIONS & SPENDING ═══════════════ */}
      <section className="mt-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-7 w-1 rounded-full bg-gradient-to-b from-purple-500 to-blue-500" />
          <h2 className="text-xl font-bold tracking-tight text-foreground dark:text-white">Activity & Spending</h2>
        </div>
        <Suspense fallback={<OverviewSkeleton />}>
          <OverviewSection accounts={accounts} userCurrency={user?.currency} />
        </Suspense>
      </section>

      {/* ═══════════════ ACCOUNTS ═══════════════ */}
      <section className="mt-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-7 w-1 rounded-full bg-gradient-to-b from-emerald-500 to-cyan-500" />
          <h2 className="text-xl font-bold tracking-tight text-foreground dark:text-white">Your Accounts</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Add New Account */}
          <CreateAccountDrawer>
            <div className="group relative rounded-2xl border-2 border-dashed border-border/50 dark:border-slate-700/60 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 cursor-pointer h-full min-h-[150px] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-900/10 dark:to-pink-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <div className="relative flex flex-col items-center gap-3 text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
                <div className="flex items-center justify-center h-11 w-11 rounded-full border-2 border-dashed border-current group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                  <Plus className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                </div>
                <p className="text-sm font-semibold">Add New Account</p>
              </div>
            </div>
          </CreateAccountDrawer>

          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} userCurrency={user?.currency} />
          ))}
        </div>
      </section>

    </div>
  );
};

export default DashboardPage;