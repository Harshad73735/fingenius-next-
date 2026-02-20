import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ThemeScript } from "@/components/theme-script";
import NavigationProgress from "@/components/navigation-progress";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "FinGenius",
  description: "One Stop Finance Platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        variables: { colorPrimary: "#9333ea" },
      }}
    >
      {/*
        suppressHydrationWarning on <html> is required because ThemeScript
        adds the "dark" class before React hydrates, which causes a mismatch.
        suppressHydrationWarning tells React to ignore that single attribute diff.
      */}
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Runs BEFORE paint — adds "dark" class instantly if saved, so no flash */}
          <ThemeScript />
        </head>
        <body
          className={`${inter.className} bg-white dark:bg-slate-900 text-black dark:text-white transition-colors duration-300 overflow-x-hidden`}
        >
          <NavigationProgress />
          <Header />
          <main className="min-h-screen bg-white dark:bg-slate-900 mt-16 overflow-x-hidden">
            {children}
          </main>
          <Toaster richColors />
          <footer className="bg-blue-50 dark:bg-slate-800 py-12 border-t border-border/40">
            <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
              <p>Made with 💗 by FinGenius</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
