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
          className={`${inter.className} bg-slate-50 dark:bg-[#0B0F19] text-black dark:text-white transition-colors duration-300 overflow-x-hidden`}
        >
          {/* Global Ambient Background */}
          <div className="fixed inset-0 pointer-events-none z-[-1]">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] mix-blend-screen dark:opacity-30 animate-mesh" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen dark:opacity-30 animate-mesh" style={{ animationDelay: '2s' }} />
          </div>
          <NavigationProgress />
          <Header />
          <main className="min-h-screen mt-16 overflow-x-hidden relative z-0">
            {children}
          </main>
          <Toaster richColors />
          <footer className="py-12 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md">
            <div className="container mx-auto px-4 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
              <p>Made with 💗 by FinGenius</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
