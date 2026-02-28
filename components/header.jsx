import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { LayoutDashboard, PenBox, Moon, Sun } from "lucide-react";
import { checkUser } from "@/lib/checkUser";
import { ThemeToggleWrapper } from "./theme-toggle-wrapper";

const Header = async () => {
  await checkUser
  return (
    <div className="fixed top-0 w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl z-50 border-b border-border/50 dark:border-slate-800/50 shadow-sm overflow-x-hidden transition-all duration-300">
        <nav className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between w-full max-w-full">
          <Link href="/" className="shrink-0 mr-1 sm:mr-4">
            <Image 
              src={"/logo.png"} 
              alt="FinGenius Logo" 
              height={60} 
              width={200} 
              className="h-7 sm:h-12 w-auto object-contain"
              priority
            />
          </Link>
       
          <div className="flex items-center gap-1 sm:gap-4 shrink-0">
            <SignedIn>
              <Link href={"/dashboard"} prefetch={true} className="flex flex-col sm:flex-row items-center justify-center">
                <Button variant="ghost" className="px-3 sm:px-4 h-9 sm:h-10 rounded-xl font-semibold text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200">
                  <LayoutDashboard size={18} className="sm:mr-2" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>

              <Link href={"/transaction/create"} prefetch={true} className="flex items-center">
                <Button className="px-3 sm:px-4 h-9 sm:h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md shadow-purple-500/20 transition-all duration-200 flex items-center gap-2">
                  <PenBox size={18} />
                  <span className="hidden sm:inline">Add Transaction</span>
                </Button>
              </Link>
            </SignedIn>

            <SignedOut>
              <SignInButton forceRedirectUrl="/dashboard">
                <Button variant="outline" className="rounded-xl font-semibold h-10 px-6 border-border/60 hover:bg-accent hover:text-accent-foreground transition-all duration-200">
                  Login
                </Button>
              </SignInButton>
            </SignedOut>

            <ThemeToggleWrapper />

            <SignedIn>
              <div suppressHydrationWarning>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 sm:w-10 sm:h-10",
                    },
                  }}
                />
              </div>
            </SignedIn>
          </div>
        </nav>
    </div>
  );
};

export default Header;
