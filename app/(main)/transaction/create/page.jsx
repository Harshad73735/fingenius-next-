import { getUserAccounts } from '@/actions/dashboard';
import { checkUser } from '@/lib/checkUser';
import { defaultCategories } from '@/data/categories';
import React from 'react';
import AddTransactionForm from '../_components/transaction-form';
import { getTransaction } from '@/actions/transaction';

const AddTransactionPage = async ({ searchParams }) => {
  const params = await searchParams;
  const editId = params?.edit;

  const user = await checkUser();
  const accounts = await getUserAccounts();

  let initialData = null;
  if (editId) {
    const transaction = await getTransaction(editId);
    initialData = transaction;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-16 relative">
      {/* Ambient premium background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xl h-64 bg-purple-500/10 dark:bg-purple-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Premium page header */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight gradient-title mb-3">
          {editId ? "Edit Transaction" : "Add Transaction"}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-lg">
          {editId
            ? "Update your transaction details below to keep your records accurate."
            : "Manually fill in the details, or simply scan a receipt and let AI do the heavy lifting."}
        </p>
      </div>

      {/* Card wrapper for the form — completely overhauled premium glassmorphism */}
      <div className="relative rounded-3xl border border-white/20 dark:border-slate-700/50 bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl shadow-2xl shadow-purple-900/5 p-6 sm:p-10 overflow-visible transition-all duration-300 hover:shadow-purple-900/10 dark:shadow-none">
        {/* Subtle inner highlight */}
        <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/40 dark:ring-white/5 pointer-events-none" />
        
        <div className="relative z-10">
          <AddTransactionForm
            accounts={accounts}
            categories={defaultCategories}
            editMode={!!editId}
            initialData={initialData}
            userCurrency={user?.currency}
          />
        </div>
      </div>
    </div>
  );
};

export default AddTransactionPage;
