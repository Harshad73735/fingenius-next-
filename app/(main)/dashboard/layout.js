import React, { Suspense } from 'react';
import { BarLoader } from 'react-spinners';

const DashboardLayout = ({ children }) => {
  return (
    <div className="px-5 bg-white dark:bg-slate-900 min-h-screen">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-6xl font-bold tracking-tight gradient-title dark:text-white">
          Dashboard
        </h1>
      </div>
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        {children}
      </Suspense>
    </div>
  );
};

export default DashboardLayout;
