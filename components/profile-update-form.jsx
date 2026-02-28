"use client";

import { updateUserProfile } from "@/actions/accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useFetch from "@/hooks/use-fetch";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Globe, Settings, X, Mail, UserCircle, Loader2, Info } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const ProfileUpdateForm = ({ userData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState(userData?.email || "");
  const [name, setName] = useState(userData?.name || "");
  const [currency, setCurrency] = useState(userData?.currency || "USD");

  const { loading, fn: updateProfileFn, data: result } = useFetch(updateUserProfile);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !name) {
      toast.error("Please fill in all required fields.");
      return;
    }
    await updateProfileFn({ email, name, currency });
  };

  React.useEffect(() => {
    if (result?.success) {
      toast.success("Preferences updated successfully!");
      setIsOpen(false);
    }
  }, [result]);

  return (
    <>
      {/* Show alert if email is not set */}
      {!userData?.email || userData.email.trim() === "" ? (
        <div className="mx-4 sm:mx-8 mt-6 mb-2 p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-800/40 rounded-full shrink-0">
              <Info className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">Complete Your Profile</h4>
              <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-0.5 leading-relaxed max-w-xl">
                Please add your email address to receive automated monthly financial reports and important budget alerts.
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsOpen(true)}
            className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all"
            size="sm"
          >
            <Settings className="mr-2 h-4 w-4" />
            Update Now
          </Button>
        </div>
      ) : (
        <div className="flex justify-end items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 font-medium group transition-colors"
          >
            <Settings className="mr-2 h-4 w-4 group-hover:rotate-45 transition-transform duration-300" />
            Preferences
          </Button>
        </div>
      )}

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => !loading && setIsOpen(false)}
        >
          {/* Modal Card */}
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div className="relative overflow-hidden px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-sm border border-white/20">
                    <Settings className="h-5 w-5 text-white animate-spin-slow" style={{ animationDuration: '8s' }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground dark:text-white">Preferences</h2>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">Manage your personal and app settings</p>
                  </div>
                </div>
                <button
                  onClick={() => !loading && setIsOpen(false)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors focus:outline-none"
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              
              {/* Profile Details Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2">
                  <UserCircle className="h-4 w-4 text-purple-500" />
                  <h3 className="text-sm font-semibold text-foreground dark:text-slate-200 uppercase tracking-wider">Profile Details</h3>
                </div>
                
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                        <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      </div>
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        required
                        className="pl-9 text-base sm:text-sm bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-900 transition-colors h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                        <Mail className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      </div>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        required
                        className="pl-9 text-base sm:text-sm bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-900 transition-colors h-11"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Settings Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-t border-slate-100 dark:border-slate-800/50 pt-5">
                  <Globe className="h-4 w-4 text-emerald-500" />
                  <h3 className="text-sm font-semibold text-foreground dark:text-slate-200 uppercase tracking-wider">Financial Settings</h3>
                </div>
                
                <div className="space-y-1.5 w-full sm:w-1/2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-0.5">Default Currency</label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-900 h-10 transition-colors">
                      <SelectValue placeholder="Select Currency" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-[240px] dark:bg-slate-800 dark:border-slate-700">
                      {SUPPORTED_CURRENCIES.map((c) => (
                        <SelectItem key={c.code} value={c.code} className="dark:text-slate-200 dark:focus:bg-slate-700 py-2.5">
                          <span className="font-medium mr-2">{c.symbol}</span>
                          <span className="text-muted-foreground mr-1">{c.code}</span>
                          <span>- {c.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground mt-1 ml-0.5">Used for all dashboards and reports.</p>
                </div>
              </div>

              {/* ── Action Buttons ── */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800/60 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="w-full sm:w-auto h-10 font-medium dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto h-10 font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-500/20 transition-all border-0"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    "Save Preferences"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
