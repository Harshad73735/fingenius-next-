"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ArrowDownRight, ArrowUpRight, LayoutList, PieChartIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ["#8b5cf6","#ec4899","#06b6d4","#10b981","#f59e0b","#f43f5e","#6366f1","#84cc16"];

// Custom glassmorphism tooltip
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-border/60 shadow-xl px-3.5 py-2.5">
      <p className="text-xs font-semibold text-foreground dark:text-white">{payload[0].name}</p>
      <p className="text-sm font-bold text-purple-600 dark:text-purple-400">${payload[0].value.toFixed(2)}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">
        {((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}% of expenses
      </p>
    </div>
  );
};

const DashboardOverview = ({ accounts, transactions }) => {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id
  );

  const accountTransactions = transactions.filter((t) => t.accountId === selectedAccountId);
  const recentTransactions = [...accountTransactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const currentDate = new Date();
  const currentMonthExpenses = accountTransactions.filter((t) => {
    const d = new Date(t.date);
    return t.type === "EXPENSE" && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
  });

  const expensesByCategory = currentMonthExpenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const totalExpenseThisMonth = currentMonthExpenses.reduce((s, t) => s + t.amount, 0);

  const pieChartData = Object.entries(expensesByCategory)
    .map(([name, value]) => ({ name, value, total: totalExpenseThisMonth }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* ── Recent Transactions ── */}
      <Card className="border border-border/50 dark:border-slate-700/50 shadow-sm dark:bg-slate-800/40">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="flex items-center gap-2">
            <LayoutList className="h-4 w-4 text-purple-500" />
            <CardTitle className="text-sm font-semibold text-foreground dark:text-white">Recent Transactions</CardTitle>
          </div>
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="h-7 w-[120px] text-xs rounded-lg border-border/60 dark:border-slate-700">
              <SelectValue placeholder="Account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id} className="text-xs">{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <LayoutList className="h-8 w-8 opacity-20" />
              <p className="text-sm">No recent transactions</p>
              <Link href="/transaction/create" className="text-xs text-purple-500 hover:underline">Add your first one →</Link>
            </div>
          ) : (
            <div className="space-y-1">
              {recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-muted/40 dark:hover:bg-slate-700/30 transition-colors group">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground dark:text-white truncate">
                      {t.description || <span className="text-muted-foreground italic">No description</span>}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{format(new Date(t.date), "MMM d, yyyy")}</p>
                  </div>
                  <div className={cn(
                    "flex items-center gap-0.5 text-sm font-semibold tabular-nums ml-3 shrink-0",
                    t.type === "EXPENSE" ? "text-rose-500 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                  )}>
                    {t.type === "EXPENSE" ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                    ${t.amount.toFixed(2)}
                  </div>
                </div>
              ))}

              {accountTransactions.length > 5 && (
                <Link
                  href={`/account/${selectedAccountId}`}
                  className="block text-center text-xs text-purple-500 hover:text-purple-600 pt-2 hover:underline"
                >
                  View all {accountTransactions.length} transactions →
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Monthly Expense Breakdown ── */}
      <Card className="border border-border/50 dark:border-slate-700/50 shadow-sm dark:bg-slate-800/40">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-pink-500" />
            <CardTitle className="text-sm font-semibold text-foreground dark:text-white">This Month's Spending</CardTitle>
          </div>
          {totalExpenseThisMonth > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Total: <span className="font-semibold text-rose-500">${totalExpenseThisMonth.toFixed(2)}</span>
            </p>
          )}
        </CardHeader>
        <CardContent className="px-3 pb-4">
          {pieChartData.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <PieChartIcon className="h-8 w-8 opacity-20" />
              <p className="text-sm">No expenses this month</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Donut chart */}
              <div className="h-[170px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieChartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category legend rows */}
              <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1 scrollbar-thin">
                {pieChartData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-muted-foreground truncate capitalize">{entry.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-semibold text-foreground dark:text-white">${entry.value.toFixed(2)}</span>
                      <span className="text-[10px] text-muted-foreground ml-1">({((entry.value / totalExpenseThisMonth) * 100).toFixed(0)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;