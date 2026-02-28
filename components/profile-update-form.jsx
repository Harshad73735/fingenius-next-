"use client";

import { updateUserProfile } from "@/actions/accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useFetch from "@/hooks/use-fetch";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Globe, Settings, X, Mail, UserCircle, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

export const ProfileUpdateForm = ({ userData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState(userData?.email || "");
  const [name, setName] = useState(userData?.name || "");
  const [currency, setCurrency] = useState(userData?.currency || "USD");

  const { loading, fn: updateProfileFn, data: result } = useFetch(updateUserProfile);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !name) {
      toast.error("Please fill in all fields");
      return;
    }
    await updateProfileFn({ email, name, currency });
  };

  React.useEffect(() => {
    if (result?.success) {
      toast.success("Profile updated successfully!");
      setIsOpen(false);
    }
  }, [result]);

  return (
    <>
      {/* Show alert if email is not set */}
      {!userData?.email || userData.email.trim() === "" ? (
        <div className="mx-5 mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
            ℹ️ Please update your profile with your email to receive budget alerts and other notifications.
          </p>
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <User className="mr-2 h-4 w-4" />
            Update Profile
          </Button>
        </div>
      ) : (
        <div className="flex justify-end items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 font-medium"
          >
            <Settings className="mr-2 h-4 w-4" />
            Preferences
          </Button>
        </div>
      )}

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Modal Card */}
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground dark:text-white">Preferences</h2>
                  <p className="text-xs text-muted-foreground">Manage your profile settings</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-muted-foreground hover:text-foreground dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground dark:text-slate-200 flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-purple-500" />
                  Full Name
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="h-11"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground dark:text-slate-200 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-purple-500" />
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="h-11"
                />
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground dark:text-slate-200 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-purple-500" />
                  Default Currency
                </label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-full h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                    <SelectValue placeholder="Select Currency" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-[240px] dark:bg-slate-800 dark:border-slate-700">
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code} className="dark:text-slate-200 dark:focus:bg-slate-700">
                        {c.code} ({c.symbol}) - {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ── Action Buttons ── */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="px-5 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
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
