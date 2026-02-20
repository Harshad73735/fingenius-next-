"use client";

import { updateBudget } from '@/actions/budget';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import useFetch from '@/hooks/use-fetch';
import { AlertTriangle, Check, Pencil, Target, TrendingDown, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/currency';

const BudgetProgress = ({ initialBudget, currentExpenses, userCurrency }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(initialBudget?.amount?.toString() || "");

  const { loading: isLoading, fn: updateBudgetFn, data: updatedBudget, error } = useFetch(updateBudget);

  const percentUsed = initialBudget ? Math.min((currentExpenses / initialBudget.amount) * 100, 100) : 0;
  const remaining = initialBudget ? initialBudget.amount - currentExpenses : 0;
  const isOver = initialBudget && currentExpenses > initialBudget.amount;
  const isWarning = percentUsed >= 75 && !isOver;

  const progressColor = isOver
    ? "from-red-500 to-rose-600"
    : isWarning
    ? "from-amber-400 to-orange-500"
    : "from-emerald-400 to-green-500";

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);
    if (isNaN(amount) || amount <= 0) { toast.error("Please enter a valid budget amount"); return; }
    await updateBudgetFn(amount);
  };

  const handleCancel = () => { setNewBudget(initialBudget?.amount?.toString() || ""); setIsEditing(false); };

  useEffect(() => {
    if (updatedBudget?.success) { setIsEditing(false); toast.success("Budget updated!"); }
  }, [updatedBudget]);

  useEffect(() => {
    if (error) toast.error(error.message || "Failed to update budget");
  }, [error]);

  return (
    <Card className="border border-border/50 dark:border-slate-700/50 shadow-sm dark:bg-slate-800/40 overflow-hidden">
      {/* Top status stripe */}
      {isOver && <div className="h-1 w-full bg-gradient-to-r from-red-500 to-rose-600" />}
      {isWarning && <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-orange-500" />}
      {!isOver && !isWarning && initialBudget && <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-green-500" />}

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <div className={`flex items-center justify-center h-8 w-8 rounded-lg ${isOver ? "bg-red-100 dark:bg-red-900/30" : "bg-purple-100 dark:bg-purple-900/30"}`}>
            {isOver
              ? <AlertTriangle className="h-4 w-4 text-red-500" />
              : <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-foreground dark:text-white">Monthly Budget</CardTitle>
            <p className="text-[11px] text-muted-foreground">Default account</p>
          </div>
        </div>

        {!isEditing && (
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-muted" onClick={() => setIsEditing(true)}>
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4 pb-5">
        {/* Edit mode */}
        {isEditing ? (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 dark:bg-slate-800 border border-border/50">
            <span className="text-sm text-muted-foreground">{formatCurrency(0, userCurrency).replace(/[0-9.,\s]/g, '')}</span>
            <Input
              type="number"
              value={newBudget}
              onChange={(e) => setNewBudget(e.target.value)}
              placeholder="Enter budget amount"
              className="flex-1 h-8 border-0 bg-transparent shadow-none text-sm focus-visible:ring-0"
              autoFocus
              disabled={isLoading}
              onKeyDown={(e) => { if (e.key === "Enter") handleUpdateBudget(); if (e.key === "Escape") handleCancel(); }}
            />
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30" onClick={handleUpdateBudget} disabled={isLoading}>
              <Check className="h-4 w-4 text-emerald-600" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30" onClick={handleCancel} disabled={isLoading}>
              <X className="h-4 w-4 text-rose-500" />
            </Button>
          </div>
        ) : !initialBudget ? (
          /* No budget set CTA */
          <button
            onClick={() => setIsEditing(true)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-border/60 dark:border-slate-700 text-muted-foreground hover:border-purple-400 hover:text-purple-500 transition-colors"
          >
            <Target className="h-4 w-4" />
            <span className="text-sm font-medium">Set a monthly budget</span>
          </button>
        ) : (
          /* Budget display */
          <div className="space-y-3">
            {/* Figures */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold tabular-nums text-foreground dark:text-white">
                  {formatCurrency(currentExpenses, userCurrency)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  of <span className="font-medium text-foreground dark:text-white">{formatCurrency(initialBudget.amount, userCurrency)}</span> budget
                </p>
              </div>
              <div className="text-right">
                <p className={`text-base font-semibold tabular-nums ${isOver ? "text-rose-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                  {isOver ? `${formatCurrency(Math.abs(remaining), userCurrency)} over` : `-${formatCurrency(remaining, userCurrency)}`}
                </p>
                <p className="text-xs text-muted-foreground">{isOver ? "over budget" : "remaining"}</p>
              </div>
            </div>

            {/* Animated progress bar */}
            <div className="space-y-1.5">
              <div className="h-3 w-full rounded-full bg-muted/70 dark:bg-slate-700 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${progressColor} transition-all duration-700 ease-out`}
                  style={{ width: `${Math.min(percentUsed, 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-xs font-semibold ${isOver ? "text-rose-500" : isWarning ? "text-amber-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                  {percentUsed.toFixed(0)}%
                  {isOver ? " — Over budget!" : isWarning ? " — Almost there" : " spent"}
                </span>
                {isOver && (
                  <span className="text-[10px] text-rose-500 flex items-center gap-0.5">
                    <AlertTriangle className="h-3 w-3" />
                    Budget exceeded
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetProgress;