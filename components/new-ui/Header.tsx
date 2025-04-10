"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Menu,
  Search, 
  Sun, 
  Moon, 
  Bell, 
  MessageSquare,
  PlusCircle,
  User
} from "lucide-react";
import { MobileNav } from "./MobileNav";

export function Header() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Only render the theme toggle after component has mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="w-full border-b border-border/30">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Mobile Menu Button - Only visible on mobile */}
        <div className="md:hidden">
          <MobileNav />
        </div>

        {/* Search Bar - Visible on medium screens and up */}
        <div className="hidden md:flex flex-1 px-4 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pl-10 h-9 bg-muted/40"
            />
          </div>
        </div>

        {/* Right Menu Items */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              {/* Navigation Icons - Some hidden on small screens */}
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <Bell className="h-5 w-5" />
                </Button>
              </Link>
              
              <Link href="/create-post" className="hidden sm:block">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <PlusCircle className="h-4 w-4" />
                  <span>Post</span>
                </Button>
              </Link>
              
              {/* Profile Link */}
              <Link href="/profile">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/auth/signin">Sign in</Link>
            </Button>
          )}
          
          {/* Theme Toggle - Always visible */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile Search Bar - Only visible on small screens */}
      <div className="md:hidden py-2 px-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full pl-10 h-9 bg-muted/40"
          />
        </div>
      </div>
    </header>
  );
} 