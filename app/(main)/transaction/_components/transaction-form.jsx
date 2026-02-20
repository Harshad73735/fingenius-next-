"use client";

import { transactionSchema } from "@/app/lib/schema";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import useFetch from "@/hooks/use-fetch";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTransaction, updateTransaction } from "@/actions/transaction";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import ReceiptScanner from "./receipt-scanner";
import { formatCurrency } from "@/lib/currency";

const AddTransactionForm = ({ accounts, categories,editMode = false,
  initialData = null, userCurrency }) => {
    const router=useRouter();
    const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
       const {
      register,
      handleSubmit,
      formState: { errors },
      watch,
      setValue,
      getValues,
      reset,
    } = useForm({
      resolver: zodResolver(transactionSchema),
      defaultValues:
        editMode && initialData
          ? {
              type: initialData.type,
              amount: initialData.amount.toString(),
              description: initialData.description,
              accountId: initialData.accountId,
              category: initialData.category,
              date: new Date(initialData.date),
              isRecurring: initialData.isRecurring,
              ...(initialData.recurringInterval && {
                recurringInterval: initialData.recurringInterval,
              }),
            }
          : {
              type: "EXPENSE",
              amount: "",
              description: "",
              accountId: accounts.find((ac) => ac.isDefault)?.id,
              date: new Date(),
              isRecurring: false,
            },
    });



//   const {
//     loading: transactionLoading,
//     fn: transactionFn,
//     data: transactionResult,
//   } = useFetch(editMode ? updateTransaction : createTransaction);

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
  } = useFetch(editMode ? updateTransaction : createTransaction);

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");
  
  const onSubmit = (data) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
      date: data.date || new Date(), // Force today's date if not set
    };

    if (editMode) {
      transactionFn(editId, formData);
    } else {
      transactionFn(formData);
    }  
  };

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      // Navigate immediately — don't wait for anything else
      router.push(`/account/${transactionResult.data.accountId}`);
      // Toast shown after navigation is queued
      toast.success(editMode ? "Transaction updated successfully" : "Transaction created successfully");
      reset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionResult, transactionLoading]);

  const filteredCategories = categories.filter(
    (category) => category.type === type
  );

   const handleScanComplete = (scannedData) => {
    if (scannedData) {
      setValue("amount", scannedData.amount.toString());
      setValue("date", new Date(scannedData.date));
      if (scannedData.description) {
        setValue("description", scannedData.description);
      }
      if (scannedData.category) {
        setValue("category", scannedData.category);
      }
      // Toast is already shown by ReceiptScanner component — do NOT call it again here
    }
  };

  return  <form 
  onSubmit={handleSubmit(onSubmit)} 
  className="space-y-6">
      {/* Receipt Scanner - Only show in create mode */}
      {
      !editMode && 
      <ReceiptScanner onScanComplete={handleScanComplete} />}

      {/* Type */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground/90 tracking-wide uppercase text-[11px]">Type</label>
        <Select
          onValueChange={(value) => setValue("type", value)}
          defaultValue={type}
        >
          <SelectTrigger className="h-12 rounded-xl border-border/60 bg-white/50 dark:bg-slate-900/50 focus:ring-purple-500/50 font-medium">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/60">
            <SelectItem value="EXPENSE">Expense</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-rose-500 font-medium">{errors.type.message}</p>
        )}
      </div>

      {/* Amount and Account */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground/90 tracking-wide uppercase text-[11px]">Amount</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">{formatCurrency(0, userCurrency).replace(/[0-9.,\s]/g, '')}</span>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              className="pl-10 text-2xl font-bold h-14 rounded-xl border-border/60 bg-white/50 dark:bg-slate-900/50 focus-visible:ring-purple-500/50 focus-visible:border-purple-500 shadow-sm transition-all"
              {...register("amount")}
            />
          </div>
          {errors.amount && (
            <p className="text-sm text-rose-500 font-medium">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground/90 tracking-wide uppercase text-[11px]">Account</label>
          <Select
            onValueChange={(value) => setValue("accountId", value)}
            defaultValue={getValues("accountId")}
          >
            <SelectTrigger className="h-14 rounded-xl border-border/60 bg-white/50 dark:bg-slate-900/50 focus:ring-purple-500/50 font-medium">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/60">
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} ({formatCurrency(account.balance, userCurrency)})
                </SelectItem>
              ))}
              <CreateAccountDrawer>
                <Button
                  variant="ghost"
                  className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 font-medium"
                >
                  + Create New Account
                </Button>
              </CreateAccountDrawer>
            </SelectContent>
          </Select>
          {errors.accountId && (
            <p className="text-sm text-rose-500 font-medium">{errors.accountId.message}</p>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground/90 tracking-wide uppercase text-[11px]">Category</label>
        <Select
          onValueChange={(value) => setValue("category", value)}
          defaultValue={getValues("category")}
        >
          <SelectTrigger className="h-12 rounded-xl border-border/60 bg-white/50 dark:bg-slate-900/50 focus:ring-purple-500/50 font-medium">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/60">
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-rose-500 font-medium">{errors.category.message}</p>
        )}
      </div>

      {/* Date */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground/90 tracking-wide uppercase text-[11px]">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full pl-3 text-left font-normal h-12 rounded-xl border-border/60 bg-white/50 dark:bg-slate-900/50 focus-visible:ring-purple-500/50",
                !date && "text-muted-foreground"
              )}
            >
              {date ? format(date, "PPP") : <span>Pick a date</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 rounded-xl border-border/60" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => setValue("date", date)}
              defaultMonth={date || new Date()}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
            />
          </PopoverContent>
        </Popover>
        {errors.date && (
          <p className="text-sm text-rose-500 font-medium">{errors.date.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground/90 tracking-wide uppercase text-[11px]">Description (Optional)</label>
        <Input 
          placeholder="What was this for?" 
          className="h-12 rounded-xl border-border/60 bg-white/50 dark:bg-slate-900/50 focus-visible:ring-purple-500/50"
          {...register("description")} 
        />
        {errors.description && (
          <p className="text-sm text-rose-500 font-medium">{errors.description.message}</p>
        )}
      </div>

      {/* Recurring Toggle */}
      <div className="flex flex-row items-center justify-between rounded-xl border border-border/60 bg-white/50 dark:bg-slate-900/50 p-4 shadow-sm transition-all hover:shadow-md">
        <div className="space-y-0.5">
          <label className="text-sm font-semibold text-foreground/90 tracking-wide uppercase">Recurring Transaction</label>
          <div className="text-xs text-muted-foreground">
            Set up an automatic schedule for this transaction
          </div>
        </div>
        <Switch
          checked={isRecurring}
          onCheckedChange={(checked) => setValue("isRecurring", checked)}
          className="data-[state=checked]:bg-purple-500"
        />
      </div>

      {/* Recurring Interval */}
      {isRecurring && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
          <label className="text-sm font-semibold text-foreground/90 tracking-wide uppercase text-[11px]">Recurring Interval</label>
          <Select
            onValueChange={(value) => setValue("recurringInterval", value)}
            defaultValue={getValues("recurringInterval")}
          >
            <SelectTrigger className="h-12 rounded-xl border-border/60 bg-white/50 dark:bg-slate-900/50 focus:ring-purple-500/50 font-medium">
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/60">
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>
          {errors.recurringInterval && (
            <p className="text-sm text-rose-500 font-medium">
              {errors.recurringInterval.message}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row gap-4 pt-6 mt-6 border-t border-border/40">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-1/3 rounded-xl h-12 text-muted-foreground hover:text-foreground font-semibold"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="w-full sm:w-2/3 rounded-xl h-12 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:opacity-90 text-white font-bold shadow-lg shadow-purple-500/25 active:scale-[0.98] transition-all" 
          disabled={transactionLoading}
        >
          {transactionLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {editMode ? "Saving Changes..." : "Processing..."}
            </>
          ) : editMode ? (
            "Update Transaction"
          ) : (
            "Save Transaction"
          )}
        </Button>
      </div>
    </form>;
};

export default AddTransactionForm;
