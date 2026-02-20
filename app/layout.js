import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/lib/theme-context";
import NavigationProgress from "@/components/navigation-progress";

const inter=Inter({subsets:["latin"]});

export const metadata = {
  title: "FinGenius",
  description: "One Stop Finance Platform",
};

export default function RootLayout({ children }) {
  return (
     <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#9333ea",
        },
      }}
    >
    <ThemeProvider>
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-white dark:bg-slate-900 text-black dark:text-white transition-colors duration-300`}
      >
        {/* Global navigation progress bar */}
        <NavigationProgress />
        <Header/>
        <main className="min-h-screen bg-white dark:bg-slate-900 mt-16">{children}</main>
      <Toaster richColors />
        {/* {footer} */}
        <footer className="bg-blue-50 dark:bg-slate-800 py-12">
          <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
            <p>Made with 💗 by FinGenius</p>
          </div>
        </footer>
      </body>
    </html>
    </ThemeProvider>
    </ClerkProvider>
  );
}
