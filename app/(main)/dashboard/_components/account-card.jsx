"use client";
import { updateDefaultAccount } from '@/actions/accounts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import useFetch from '@/hooks/use-fetch';
import { ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { toast } from 'sonner';

const AccountCard = ({ account }) => {
  const { name, type, balance, id, isDefault } = account;

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async (event) => {
    event.preventDefault();
    if (isDefault) {
      toast.warning("You need at least 1 default account");
      return;
    }
    await updateDefaultFn(id);
  };

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully");
    }
  }, [updatedAccount]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update default account");
    }
  }, [error]);

  return (
    <Card className="
      group relative overflow-hidden
      hover:-translate-y-1.5 hover:shadow-xl hover:shadow-purple-500/15
      active:scale-[0.98]
      transition-all duration-300 ease-out
      dark:bg-slate-800/70 dark:border-slate-700/60
      border border-border/60
      backdrop-blur-sm
      cursor-pointer
    ">
      {/* Animated gradient top border on hover */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <Link href={`/account/${id}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium capitalize text-foreground dark:text-white">
              {name}
            </CardTitle>
            {isDefault && (
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700/50">
                Default
              </Badge>
            )}
          </div>
          <Switch
            checked={isDefault}
            onClick={handleDefaultChange}
            disabled={updateDefaultLoading}
          />
        </CardHeader>

        <CardContent>
          <div className="flex items-end gap-1">
            <div className="text-2xl font-bold tracking-tight text-foreground dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
              ${parseFloat(balance).toFixed(2)}
            </div>
          </div>
          <p className="text-xs text-muted-foreground dark:text-slate-400 mt-0.5">
            {type.charAt(0) + type.slice(1).toLowerCase()} Account
          </p>
        </CardContent>

        <CardFooter className="flex justify-between text-sm text-muted-foreground dark:text-slate-400 pt-2 border-t border-border/40 dark:border-slate-700/40">
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span className="text-xs">Income</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 opacity-50" />
          </div>
          <div className="flex items-center gap-1 text-rose-500 dark:text-rose-400">
            <ArrowDownRight className="h-3.5 w-3.5" />
            <span className="text-xs">Expense</span>
          </div>
        </CardFooter>
      </Link>

      {/* Subtle glow overlay on hover */}
      <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-transparent transition-all duration-500 pointer-events-none" />
    </Card>
  );
};

export default AccountCard;