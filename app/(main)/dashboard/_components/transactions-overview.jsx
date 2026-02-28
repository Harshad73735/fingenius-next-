"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ArrowDownRight, ArrowUpRight, LayoutList, PieChartIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/currency';

const COLORS = ["#8b5cf6","#ec4899","#06b6d4","#10b981","#f59e0b","#f43f5e","#6366f1","#84cc16"];

// Custom glassmorphism tooltip
const CustomTooltip = ({ active, payload, userCurrency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-border/60 shadow-xl px-3.5 py-2.5">
      <p className="text-xs font-semibold text-foreground dark:text-white">{payload[0].name}</p>
      <p className="text-sm font-bold text-purple-600 dark:text-purple-400">{formatCurrency(payload[0].value, userCurrency)}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">
        {((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}% of expenses
      </p>
    </div>
  );
};

const DashboardOverview = ({ accounts, transactions, userCurrency }) => {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id
  );

  // Generate last 6 months for the filter
  const monthOptions = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      value: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleString("default", { month: "long", year: "numeric" }),
      month: d.getMonth(),
      year: d.getFullYear(),
    };
  });

  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const activeMonth = monthOptions.find((m) => m.value === selectedMonth) || monthOptions[0];

  const accountTransactions = transactions.filter((t) => t.accountId === selectedAccountId);

  // Filter transactions by selected month
  const monthFilteredTransactions = accountTransactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === activeMonth.month && d.getFullYear() === activeMonth.year;
  });

  // Apply type filter
  const filteredTransactions = typeFilter === "ALL"
    ? monthFilteredTransactions
    : monthFilteredTransactions.filter((t) => t.type === typeFilter);

  const recentTransactions = [...filteredTransactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  // Filter expenses by selected month
  const filteredExpenses = accountTransactions.filter((t) => {
    const d = new Date(t.date);
    return t.type === "EXPENSE" && d.getMonth() === activeMonth.month && d.getFullYear() === activeMonth.year;
  });

  const expensesByCategory = filteredExpenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const totalExpenses = filteredExpenses.reduce((s, t) => s + t.amount, 0);

  const pieChartData = Object.entries(expensesByCategory)
    .map(([name, value]) => ({ name, value, total: totalExpenses }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* ── Transaction Overview ── */}
      <Card className="w-full relative overflow-hidden bg-white dark:bg-slate-900 dark:border-slate-700/50">
        <CardHeader className="pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutList className="h-4 w-4 text-purple-500" />
              <CardTitle className="text-sm font-semibold text-foreground dark:text-white">Transaction Overview</CardTitle>
              <span className="text-[10px] font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded-full">
                {filteredTransactions.length}
              </span>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Month Filter */}
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="h-7 w-[130px] text-xs rounded-lg border-border/60 dark:border-slate-700 dark:bg-slate-800">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                {monthOptions.map((m) => (
                  <SelectItem key={m.value} value={m.value} className="text-xs dark:text-slate-200 dark:focus:bg-slate-700">
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Account Filter */}
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger className="h-7 w-[110px] text-xs rounded-lg border-border/60 dark:border-slate-700 dark:bg-slate-800">
                <SelectValue placeholder="Account" />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id} className="text-xs dark:text-slate-200 dark:focus:bg-slate-700">{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type Filter Tabs */}
            <div className="flex rounded-lg border border-border/60 dark:border-slate-700 overflow-hidden ml-auto">
              {[
                { value: "ALL", label: "All" },
                { value: "INCOME", label: "Income" },
                { value: "EXPENSE", label: "Expense" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTypeFilter(opt.value)}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-semibold transition-all",
                    typeFilter === opt.value
                      ? "bg-purple-600 text-white"
                      : "bg-transparent text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-4 pb-4 relative w-full">
          {recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <LayoutList className="h-8 w-8 opacity-20" />
              <p className="text-sm">No {typeFilter !== "ALL" ? typeFilter.toLowerCase() + " " : ""}transactions in {activeMonth.label}</p>
              <Link href="/transaction/create" prefetch={true} className="text-xs text-purple-500 hover:underline">Add a transaction →</Link>
            </div>
          ) : (
            <div className="overflow-x-auto pb-3 -mx-3 px-3 sm:mx-0 sm:px-0 scroll-smooth">
              <div className="space-y-2 min-w-[500px] sm:min-w-0 pr-4 sm:pr-0">
                {recentTransactions.map((t) => {
                  const colorHash = t.category ? t.category.charCodeAt(0) + t.category.length : 0;
                  const badgeColor = COLORS[colorHash % COLORS.length];

                  return (
                    <div key={t.id} className="flex flex-row items-center py-3 px-3 sm:px-4 rounded-xl border border-b-border/30 sm:border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 group cursor-pointer hover:border-border/40 gap-3">
                      <div className="flex items-center gap-3 w-full flex-1 min-w-0">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm text-white font-bold"
                          style={{ background: `linear-gradient(135deg, ${badgeColor}dd, ${badgeColor}ff)` }}
                        >
                          {t.category ? t.category.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {t.description || <span className="text-muted-foreground italic font-normal">No description</span>}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                            <p className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">{format(new Date(t.date), "MMM d, yyyy")}</p>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-bold truncate max-w-[120px]">
                              {t.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0 gap-1 ml-4 pl-2">
                          <div className={cn(
                            "text-sm font-bold tabular-nums tracking-tight flex items-center whitespace-nowrap",
                            t.type === "EXPENSE" ? "text-foreground dark:text-white" : "text-emerald-600 dark:text-emerald-400"
                          )}>
                            {t.type === "EXPENSE" ? "-" : "+"}{formatCurrency(t.amount, userCurrency)}
                          </div>
                          <div className={cn(
                            "text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-widest whitespace-nowrap",
                            t.type === "EXPENSE" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          )}>
                            {t.type}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {accountTransactions.length > 5 && (
                  <Link
                    href={`/account/${selectedAccountId}`}
                    prefetch={true}
                    className="block text-center text-xs text-purple-500 hover:text-purple-600 pt-2 hover:underline"
                  >
                    View all {accountTransactions.length} transactions →
                  </Link>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Monthly Expense Breakdown ── */}
      <Card className="pb-2 w-full relative overflow-hidden bg-white dark:bg-slate-900 dark:border-slate-700/50">
        <CardHeader className="pb-3 flex flex-col items-start gap-2 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-pink-500 shrink-0" />
              <CardTitle className="text-sm font-semibold text-foreground dark:text-white truncate">Expense Breakdown</CardTitle>
            </div>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="h-7 w-[150px] text-xs rounded-lg border-border/60 dark:border-slate-700 dark:bg-slate-800">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                {monthOptions.map((m) => (
                  <SelectItem key={m.value} value={m.value} className="text-xs dark:text-slate-200 dark:focus:bg-slate-700">
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm font-medium text-muted-foreground w-full">
            Total: <span className="font-bold text-rose-500 text-base tabular-nums">{formatCurrency(totalExpenses, userCurrency)}</span>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-4 pb-4 relative w-full">
          {pieChartData.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <PieChartIcon className="h-8 w-8 opacity-20" />
              <p className="text-sm">No expenses in {activeMonth.label}</p>
            </div>
          ) : (
            <div className="space-y-4">
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
                    <Tooltip content={<CustomTooltip userCurrency={userCurrency} />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 scroll-smooth">
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-4 sm:pr-1 scrollbar-thin min-w-[380px] sm:min-w-0">
                  {pieChartData.map((entry, i) => (
                    <div key={entry.name} className="flex items-center justify-between gap-3 py-1.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="h-3 w-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-sm font-medium text-foreground dark:text-gray-200 truncate capitalize">{entry.name}</span>
                      </div>
                      <div className="text-right shrink-0 flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground dark:text-white tabular-nums">{formatCurrency(entry.value, userCurrency)}</span>
                        <span className="text-[10px] font-bold text-muted-foreground w-8 text-right bg-slate-100 dark:bg-slate-800 py-0.5 rounded-md">
                          {((entry.value / totalExpenses) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;