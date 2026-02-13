"use client";

import { updateUserProfile } from "@/actions/accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useFetch from "@/hooks/use-fetch";
import { User } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

export const ProfileUpdateForm = ({ userData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState(userData?.email || "");
  const [name, setName] = useState(userData?.name || "");

  const { loading, fn: updateProfileFn, data: result } = useFetch(updateUserProfile);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !name) {
      toast.error("Please fill in all fields");
      return;
    }
    await updateProfileFn({ email, name });
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
      ) : null}

      {/* Modal / Form */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 max-w-md w-full">
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
              <div className="flex gap-3 justify-end">
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
