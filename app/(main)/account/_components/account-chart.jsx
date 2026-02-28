"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { endOfDay, format, startOfDay, subDays } from 'date-fns';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency } from '@/lib/currency';

const DATE_RANGES = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  ALL: { label: "All Time", days: null },
};

// Custom tooltip for the bar chart
const CustomTooltip = ({ active, payload, label, userCurrency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-border/60 dark:border-slate-700/60 shadow-xl p-3.5 min-w-[140px]">
      <p className="text-xs font-semibold text-muted-foreground mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.fill }} />
            <span className="text-xs text-muted-foreground capitalize">{p.name}</span>
          </div>
          <span className="text-xs font-bold text-foreground dark:text-white">{formatCurrency(p.value, userCurrency)}</span>
        </div>
      ))}
    </div>
  );
};

const AccountChart = ({ transactions, userCurrency }) => {
  const [dateRange, setDateRange] = useState("1M");

  const filteredData = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = range.days ? startOfDay(subDays(now, range.days)) : startOfDay(new Date(0));

    const filtered = transactions.filter(
      (t) => new Date(t.date) >= startDate && new Date(t.date) <= endOfDay(now)
    );

    const grouped = filtered.reduce((acc, t) => {
      const date = format(new Date(t.date), "MMM dd");
      if (!acc[date]) acc[date] = { date, income: 0, expense: 0 };
      if (t.type === "INCOME") acc[date].income += t.amount;
      else acc[date].expense += t.amount;
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [transactions, dateRange]);

  const totals = useMemo(() => filteredData.reduce(
    (acc, d) => ({ income: acc.income + d.income, expense: acc.expense + d.expense }),
    { income: 0, expense: 0 }
  ), [filteredData]);

  const net = totals.income - totals.expense;

  return (
    <Card className="rounded-2xl border border-border/50 dark:border-slate-700/50 bg-white/40 dark:bg-slate-900 backdrop-blur-md shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-semibold text-foreground dark:text-white">
          Transaction Overview
        </CardTitle>
        <Select defaultValue={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[130px] h-9 text-xs font-medium rounded-xl border-border/60 bg-white/50 dark:bg-slate-900/50">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/60">
            {Object.entries(DATE_RANGES).map(([key, { label }]) => (
              <SelectItem key={key} value={key} className="text-xs">{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Stat pills */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-1 rounded-2xl bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-200/60 dark:border-emerald-800/40 p-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Income</span>
            </div>
            <p className="text-base sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">
              {formatCurrency(totals.income, userCurrency)}
            </p>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-2xl bg-rose-50/80 dark:bg-rose-900/20 border border-rose-200/60 dark:border-rose-800/40 p-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-rose-500 dark:text-rose-400">
              <TrendingDown className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Expense</span>
            </div>
            <p className="text-base sm:text-xl font-extrabold text-rose-500 dark:text-rose-400 tabular-nums tracking-tight">
              {formatCurrency(totals.expense, userCurrency)}
            </p>
          </div>
          <div className={`flex flex-col items-center gap-1 rounded-2xl p-4 border shadow-sm ${
            net >= 0
              ? "bg-blue-50/80 dark:bg-blue-900/20 border-blue-200/60 dark:border-blue-800/40"
              : "bg-orange-50/80 dark:bg-orange-900/20 border-orange-200/60 dark:border-orange-800/40"
          }`}>
            <div className={`flex items-center gap-1.5 ${net >= 0 ? "text-blue-600 dark:text-blue-400" : "text-orange-500 dark:text-orange-400"}`}>
              <Wallet className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Net</span>
            </div>
            <p className={`text-base sm:text-xl font-extrabold tabular-nums tracking-tight ${net >= 0 ? "text-blue-600 dark:text-blue-400" : "text-orange-500 dark:text-orange-400"}`}>
              {net >= 0 ? "+" : ""}{formatCurrency(net, userCurrency)}
            </p>
          </div>
        </div>

        {/* Bar chart */}
        {filteredData.length === 0 ? (
          <div className="h-[240px] flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Wallet className="h-10 w-10 opacity-20" />
            <p className="text-sm">No transactions in this period</p>
          </div>
        ) : (
          <div className="h-[240px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }} barSize={16} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.3)" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(v) => formatCurrency(v, userCurrency).replace(/\.00$/, '')}
                />
                <Tooltip content={<CustomTooltip userCurrency={userCurrency} />} cursor={{ fill: 'rgba(148,163,184,0.15)', radius: 6 }} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 2, 2]} />
                <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[6, 6, 2, 2]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountChart;