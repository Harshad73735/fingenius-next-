"use client";

import React, { useEffect, useState } from 'react'
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSchema } from '@/app/lib/schema';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import useFetch from '@/hooks/use-fetch';
import { createAccount } from '@/actions/dashboard';
import { seedAccountData } from '@/actions/seed';
import { Loader2, Database } from 'lucide-react';
import { toast } from 'sonner';


const CreateAccountDrawer = ({children}) => {
 const [open, setOpen] = useState(false);
 const [seedData, setSeedData] = useState(false);
 const [isSeeding, setIsSeeding] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: "",
      isDefault: false,
    },
  });

  const {
    loading: createAccountLoading,
    fn: createAccountFn,
    error,
    data: newAccount,
  } = useFetch(createAccount);

  const onSubmit = async (data) => {
   await createAccountFn(data);
  };

  useEffect(() => {
    if (newAccount && !createAccountLoading) {
      // If seed data is enabled, seed the account
      if (seedData && newAccount.data?.id) {
        setIsSeeding(true);
        seedAccountData(newAccount.data.id)
          .then((result) => {
            if (result.success) {
              toast.success("Account created & demo data seeded!");
            } else {
              toast.success("Account created!");
              toast.error("Failed to seed demo data: " + (result.error || ""));
            }
          })
          .catch(() => {
            toast.success("Account created!");
            toast.error("Failed to seed demo data");
          })
          .finally(() => {
            setIsSeeding(false);
            reset();
            setSeedData(false);
            setOpen(false);
          });
      } else {
        toast.success("Account created successfully");
        reset();
        setSeedData(false);
        setOpen(false);
      }
    }
  }, [newAccount, reset]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to create account");
    }
  }, [error]);

  const isLoading = createAccountLoading || isSeeding;

  return (
     <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="dark:bg-slate-800 dark:border-slate-700">
        <DrawerHeader>
          <DrawerTitle className="text-foreground dark:text-white">Create New Account</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground dark:text-slate-200"
              >
                Account Name
              </label>
              <Input
                id="name"
                placeholder="e.g., Main Checking"
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="type"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground dark:text-slate-200"
              >
                Account Type
              </label>
              <Select
                onValueChange={(value) => setValue("type", value)}
                defaultValue={watch("type")}
              >
                <SelectTrigger id="type" className="dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
                  <SelectItem value="CURRENT">Current</SelectItem>
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="balance"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground dark:text-slate-200"
              >
                Initial Balance
              </label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                {...register("balance")}
              />
              {errors.balance && (
                <p className="text-sm text-red-500">{errors.balance.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3 dark:border-slate-600 dark:bg-slate-700">
              <div className="space-y-0.5">
                <label
                  htmlFor="isDefault"
                  className="text-base font-medium cursor-pointer text-foreground dark:text-white"
                >
                  Set as Default
                </label>
                <p className="text-sm text-muted-foreground dark:text-slate-400">
                  This account will be selected by default for transactions
                </p>
              </div>
              <Switch
                id="isDefault"
                checked={watch("isDefault")}
                onCheckedChange={(checked) => setValue("isDefault", checked)}
              />
            </div>

            {/* Seed Demo Data Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3 border-purple-200 dark:border-purple-800/50 bg-purple-50/50 dark:bg-purple-900/20">
              <div className="space-y-0.5">
                <label
                  htmlFor="seedData"
                  className="text-base font-medium cursor-pointer text-foreground dark:text-white flex items-center gap-2"
                >
                  <Database className="h-4 w-4 text-purple-500" />
                  Seed Demo Data
                </label>
                <p className="text-sm text-muted-foreground dark:text-slate-400">
                  Add 2 months of sample college student transactions (₹10k/month)
                </p>
              </div>
              <Switch
                id="seedData"
                checked={seedData}
                onCheckedChange={setSeedData}
                className="data-[state=checked]:bg-purple-600"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="flex-1" disabled={isLoading}>
                  Cancel
                </Button>
              </DrawerClose>

              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isSeeding ? "Seeding data..." : "Creating..."}
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default CreateAccountDrawer