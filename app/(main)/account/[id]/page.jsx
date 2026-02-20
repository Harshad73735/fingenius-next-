import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAccountWithTransactions } from "@/actions/accounts";
import TransactionTable from "../_components/transaction-table";
import AccountChart from "../_components/account-chart";
import { ArrowDownRight, ArrowUpRight, CreditCard } from "lucide-react";
import { checkUser } from "@/lib/checkUser";
import { formatCurrency } from "@/lib/currency";

async function AccountContent({ id, userCurrency }) {
  const accountData = await getAccountWithTransactions(id);
  if (!accountData) notFound();

  const { transactions, ...account } = accountData;
  const totalIncome = transactions.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6 px-4 sm:px-6 pb-10">
      {/* ─── Account Header ─── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 sm:p-8 shadow-xl shadow-purple-500/20">
        {/* Decorative blobs */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-indigo-400/20 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/20 backdrop-blur">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-medium text-white/70 uppercase tracking-widest">
                {account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white capitalize tracking-tight">
              {account.name}
            </h1>
            <p className="text-white/60 text-sm mt-1">
              {account._count.transactions} transactions
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs text-white/60 uppercase tracking-wide mb-1">Current Balance</p>
            <p className="text-3xl sm:text-4xl font-bold text-white tabular-nums">
              {formatCurrency(account.balance, userCurrency)}
            </p>
          </div>
        </div>

        {/* Mini stat row */}
        <div className="relative mt-5 pt-5 border-t border-white/20 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-7 w-7 rounded-full bg-emerald-400/20">
              <ArrowUpRight className="h-4 w-4 text-emerald-300" />
            </div>
            <div>
              <p className="text-[10px] text-white/60 uppercase tracking-wide">Income</p>
              <p className="text-sm font-semibold text-emerald-300 tabular-nums">{formatCurrency(totalIncome, userCurrency)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-7 w-7 rounded-full bg-rose-400/20">
              <ArrowDownRight className="h-4 w-4 text-rose-300" />
            </div>
            <div>
              <p className="text-[10px] text-white/60 uppercase tracking-wide">Expenses</p>
              <p className="text-sm font-semibold text-rose-300 tabular-nums">{formatCurrency(totalExpenses, userCurrency)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Chart ─── */}
      <AccountChart transactions={transactions} userCurrency={userCurrency} />

      {/* ─── Transactions ─── */}
      <div>
        <h2 className="text-base font-semibold text-foreground dark:text-white mb-3">All Transactions</h2>
        <TransactionTable transactions={transactions} userCurrency={userCurrency} />
      </div>
    </div>
  );
}

function AccountSkeleton() {
  const Shimmer = ({ className = "" }) => (
    <div className={`relative overflow-hidden rounded-lg bg-muted/60 dark:bg-slate-800/60 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent" />
    </div>
  );
  return (
    <div className="space-y-6 px-4 sm:px-6 pb-10 animate-in fade-in duration-200">
      <Shimmer className="h-52 w-full rounded-2xl" />
      <Shimmer className="h-[320px] w-full rounded-xl" />
      <Shimmer className="h-[400px] w-full rounded-xl" />
    </div>
  );
}

export default async function AccountPage({ params }) {
  const { id } = await params;
  const user = await checkUser();
  return (
    <Suspense fallback={<AccountSkeleton />}>
      <AccountContent id={id} userCurrency={user?.currency} />
    </Suspense>
  );
}
