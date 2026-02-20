import { getUserAccounts } from '@/actions/dashboard';
import { checkUser } from '@/lib/checkUser';
import { defaultCategories } from '@/data/categories';
import React from 'react';
import AddTransactionForm from '../_components/transaction-form';
import { getTransaction } from '@/actions/transaction';

const AddTransactionPage = async ({ searchParams }) => {
  const params = await searchParams;
  const editId = params?.edit;

  await checkUser();
  const accounts = await getUserAccounts();

  let initialData = null;
  if (editId) {
    const transaction = await getTransaction(editId);
    initialData = transaction;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-12">
      {/* Premium page header */}
      <div className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold gradient-title">
          {editId ? "Edit Transaction" : "Add Transaction"}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {editId
            ? "Update the details of your transaction below."
            : "Fill in the details — or scan a receipt to auto-fill everything instantly."}
        </p>
      </div>

      {/* Card wrapper for the form */}
      <div className="rounded-2xl border border-border/50 dark:border-slate-700/50 bg-card dark:bg-slate-800/40 shadow-sm p-5 sm:p-7">
        <AddTransactionForm
          accounts={accounts}
          categories={defaultCategories}
          editMode={!!editId}
          initialData={initialData}
        />
      </div>
    </div>
  );
};

export default AddTransactionPage;
