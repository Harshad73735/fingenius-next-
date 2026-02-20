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
    <div className="fixed top-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-50 border-b dark:border-slate-700 overflow-x-hidden">
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
              <Link href={"/dashboard"} className="text-gray-600 hover:text-purple-600 flex items-center">
                <Button variant="outline" className="px-2 sm:px-4">
                  <LayoutDashboard size={18} className="sm:mr-2" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>

              <Link href={"/transaction/create"} className="text-gray-600 hover:text-purple-600 flex items-center">
                <Button className="px-2 sm:px-4 flex items-center">
                  <PenBox size={18} className="sm:mr-2" />
                  <span className="hidden sm:inline">Add Transaction</span>
                </Button>
              </Link>
            </SignedIn>

            <SignedOut>
              <SignInButton forceRedirectUrl="/dashboard">
                <Button variant="outline">Login</Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <ThemeToggleWrapper />
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 sm:w-10 sm:h-10",
                  },
                }}
              />
            </SignedIn>
          </div>
        </nav>
    </div>
  );
};

export default Header;
