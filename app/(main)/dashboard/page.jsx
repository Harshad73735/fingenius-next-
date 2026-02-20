import { getDashboardData, getUserAccounts } from '@/actions/dashboard'
import CreateAccountDrawer from '@/components/create-account-drawer'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import React, { Suspense } from 'react'
import AccountCard from './_components/account-card'
import { getCurrentBudget } from '@/actions/budget'
import BudgetProgress from './_components/budget-progress'
import DashboardOverview from './_components/transactions-overview'
import { checkUser } from '@/lib/checkUser'
import { ProfileUpdateForm } from '@/components/profile-update-form'
import { BarLoader } from 'react-spinners'

// Separate component for Budget to independently suspend
async function BudgetSection({ defaultAccount }) {
  if (!defaultAccount) return null;
  const budgetData = await getCurrentBudget(defaultAccount.id);

  return (
    <BudgetProgress
      initialBudget={budgetData?.budget}
      currentExpenses={budgetData?.currentExpenses || 0}
    />
  );
}

// Separate component for Overview to independently suspend
async function OverviewSection({ accounts }) {
  const transactions = await getDashboardData(15);
  
  return (
    <DashboardOverview
      accounts={accounts}
      transactions={transactions || []}
    />
  );
}

const DashboardPage = async() => {
  const user = await checkUser(); // Ensure user exists in DB
  const accounts = await getUserAccounts();
  const defaultAccount = accounts?.find((account) => account.isDefault);

  return (
    <div className="px-5 space-y-8">
       {/* Profile Update Form Alert */}
       <ProfileUpdateForm userData={user} />

       {/* Budget Progress with Suspense */}
       <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}>
         <BudgetSection defaultAccount={defaultAccount} />
       </Suspense>

       {/* Dashboard Overview with Suspense */}
       <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}>
         <OverviewSection accounts={accounts} />
       </Suspense>

       {/* Accounts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed h-full">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
              <Plus className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>
        {accounts.length > 0 &&
          accounts?.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
      </div>

    </div>
  )
}

export default DashboardPage