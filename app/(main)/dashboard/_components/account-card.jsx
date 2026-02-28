"use client";
import { updateDefaultAccount, deleteAccount } from '@/actions/accounts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import useFetch from '@/hooks/use-fetch';
import { ArrowDownRight, ArrowUpRight, TrendingUp, ArrowRight, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/currency';

const AccountCard = ({ account, userCurrency }) => {
  const { name, type, balance, id, isDefault } = account;
  const [isNavigating, setIsNavigating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleteResult,
    error: deleteError,
  } = useFetch(deleteAccount);

  const handleDefaultChange = async (event) => {
    event.preventDefault();
    if (isDefault) {
      toast.warning("You need at least 1 default account");
      return;
    }
    await updateDefaultFn(id);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await deleteFn(id);
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

  useEffect(() => {
    if (deleteResult?.success) {
      toast.success("Account deleted successfully");
    } else if (deleteResult && !deleteResult.success) {
      toast.error(deleteResult.error || "Failed to delete account");
      setShowDeleteConfirm(false);
    }
  }, [deleteResult]);

  useEffect(() => {
    if (deleteError) {
      toast.error(deleteError.message || "Failed to delete account");
      setShowDeleteConfirm(false);
    }
  }, [deleteError]);

  // Distinct premium gradients for different account types
  const typeGradients = {
    CURRENT: "from-violet-600 via-purple-600 to-indigo-700",
    SAVINGS: "from-emerald-500 via-teal-600 to-cyan-700",
    FIXED: "from-amber-500 via-orange-600 to-rose-700",
    // Fallback
    DEFAULT: "from-slate-700 via-slate-800 to-slate-900"
  };

  const gradientClass = typeGradients[type?.toUpperCase()] || typeGradients.DEFAULT;

  return (
    <Card className={`
      group relative overflow-hidden
      hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-purple-500/20
      active:scale-[0.98]
      transition-all duration-400 ease-out
      border-0
      cursor-pointer
      min-h-[180px]
      flex flex-col justify-between
      text-white
    `}>
      {/* Dynamic Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-95 dark:opacity-100`} />
      
      {/* Premium Glass/Noise Overlay Pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      
      {/* Decorative Orbs */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors duration-500" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-black/10 rounded-full blur-xl group-hover:bg-black/20 transition-colors duration-500" />

      {/* Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm rounded-[inherit] flex flex-col items-center justify-center gap-3 p-5">
          <p className="text-sm font-semibold text-white text-center">
            Delete "{name}" account?
          </p>
          <p className="text-xs text-white/70 text-center">
            All transactions in this account will also be deleted.
          </p>
          <div className="flex gap-2 mt-1">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDeleteConfirm(false); }}
              className="px-3 py-1.5 text-xs font-medium bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white"
              disabled={deleteLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white flex items-center gap-1.5"
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <><Loader2 className="h-3 w-3 animate-spin" /> Deleting...</>
              ) : (
                <><Trash2 className="h-3 w-3" /> Delete</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Card Content ── */}
      <div className="relative z-10 p-5 flex flex-col h-full grow">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-white/90 tracking-wide text-sm drop-shadow-sm uppercase">
              {name}
            </h3>
            <p className="text-[10px] uppercase font-bold tracking-widest text-white/60">
              {type} ACCOUNT
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isDefault && (
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0 backdrop-blur-md shadow-sm pointer-events-none">
                Default
              </Badge>
            )}
            
            {/* Delete button */}
            <div onClick={(e) => e.preventDefault()} className="z-20 relative">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDeleteConfirm(true); }}
                className="flex items-center justify-center h-7 w-7 rounded-lg bg-white/15 hover:bg-red-500/80 transition-colors duration-200"
                title="Delete account"
              >
                <Trash2 className="h-3.5 w-3.5 text-white" />
              </button>
            </div>

            {/* The switch */}
            <div onClick={(e) => e.preventDefault()} className="z-20 relative">
              <Switch
                checked={isDefault}
                onCheckedChange={(checked) => handleDefaultChange({ preventDefault: () => {} })}
                disabled={updateDefaultLoading}
                className="data-[state=checked]:bg-emerald-400 data-[state=unchecked]:bg-white/20"
              />
            </div>
          </div>
        </div>

        {/* Microchip icon to make it feel like a physical card */}
        <div className="mt-2 mb-4 opacity-70">
          <svg width="32" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="24" rx="4" fill="url(#paint0_linear)" />
            <path d="M0 8H10M0 16H10M22 8H32M22 16H32M10 0V24M22 0V24" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <defs>
              <linearGradient id="paint0_linear" x1="0" y1="0" x2="32" y2="24" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FBBF24" />
                <stop offset="1" stopColor="#D97706" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <Link 
          href={`/account/${id}`} 
          prefetch={true} 
          onClick={() => setIsNavigating(true)}
          className="mt-auto block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg -m-2 p-2 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-end justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-white/70">Current Balance</p>
              <div className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
                {formatCurrency(balance, userCurrency)}
              </div>
            </div>
            {/* Visual Indicator for Navigation */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/80 group-hover:text-white transition-colors bg-white/10 px-2.5 py-1.5 rounded-full backdrop-blur-sm">
              <span className="hidden sm:inline">Transactions</span>
              {isNavigating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Subtle glow overlay on hover */}
      <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/10 group-hover:to-transparent transition-all duration-500 pointer-events-none z-20" />
    </Card>
  );
};

export default AccountCard;