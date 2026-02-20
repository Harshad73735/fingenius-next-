"use client";

import { updateUserProfile } from "@/actions/accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useFetch from "@/hooks/use-fetch";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Globe, Settings } from "lucide-react";
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

      {/* Modal / Form */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setIsOpen(false)}>
          <div 
            className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 w-full sm:max-w-md max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Update Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-purple-500" /> Default Currency
                </label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Currency" />
                  </SelectTrigger>
                  <SelectContent position="popper" side="top" className="max-h-[200px]">
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.code} ({c.symbol}) - {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
