"use client";

import { useState, useEffect, useRef } from "react";
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
  User,
  Loader2
} from "lucide-react";
import { MobileNav } from "./MobileNav";
import { trpc } from "@/lib/trpc/client";
import { useDebounce } from "@uidotdev/usehooks";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Type for search results
interface SearchUser {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
}

// Define the expected user type from the session
interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string;
}

export function Header() {
  const { data: session } = useSession();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // State for Desktop Search
  const [desktopSearchQuery, setDesktopSearchQuery] = useState("");
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false);
  const debouncedDesktopSearchQuery = useDebounce(desktopSearchQuery, 300);

  // State for Mobile Search
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const debouncedMobileSearchQuery = useDebounce(mobileSearchQuery, 300);

  // Determine active query and setter for tRPC
  const activeQuery = desktopSearchQuery.length > 1 ? debouncedDesktopSearchQuery : 
                       mobileSearchQuery.length > 1 ? debouncedMobileSearchQuery : "";
  const isQueryActive = activeQuery.length > 1;

  // Combined tRPC query
  const { data: searchResults, isLoading: isSearchLoading } = trpc.user.searchUsers.useQuery(
    { query: activeQuery },
    {
      enabled: isQueryActive, 
      onSuccess: (data) => {
        const hasResults = data && data.length > 0;
        if (desktopSearchQuery.length > 1) setIsDesktopSearchOpen(hasResults);
        if (mobileSearchQuery.length > 1) setIsMobileSearchOpen(hasResults);
      },
      onError: () => {
        setIsDesktopSearchOpen(false);
        setIsMobileSearchOpen(false);
      }
    }
  );

  // Only render the theme toggle after component has mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close search results when query is short
  useEffect(() => {
    if (desktopSearchQuery.length < 2) {
      setIsDesktopSearchOpen(false);
    }
  }, [desktopSearchQuery]);

  useEffect(() => {
    if (mobileSearchQuery.length < 2) {
      setIsMobileSearchOpen(false);
    }
  }, [mobileSearchQuery]);

  // Helper function to render search results content
  const renderSearchResults = (query: string, results: SearchUser[] | undefined, loading: boolean, closeSearch: () => void) => (
    <>
      {loading && (
        <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Searching...
        </div>
      )}
      {!loading && results && results.length === 0 && query.length > 1 && (
        <div className="p-4 text-center text-sm text-muted-foreground">
          No users found for "{query}"
        </div>
      )}
      {!loading && results && results.length > 0 && (
        <div className="max-h-[300px] overflow-y-auto">
          {results.map((user) => (
            <Link 
              key={user.id} 
              href={`/profile/${user.username}`} 
              className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
              onClick={closeSearch}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image || undefined} alt={user.name || user.username} />
                <AvatarFallback>{user.name ? user.name[0].toUpperCase() : user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{user.name || user.username}</p>
                <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );

  const closeDesktopSearch = () => {
      setIsDesktopSearchOpen(false);
      setDesktopSearchQuery("");
  };

  const closeMobileSearch = () => {
      setIsMobileSearchOpen(false);
      setMobileSearchQuery("");
  };

  const user = session?.user as SessionUser | undefined; // Assert SessionUser type

  return (
    <header className="w-full border-b border-border/30">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <MobileNav />
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex flex-1 px-4 max-w-xl mx-auto">
          <Popover open={isDesktopSearchOpen} onOpenChange={setIsDesktopSearchOpen}>
            <PopoverTrigger asChild>
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className={`w-full pl-10 h-10 border focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-primary/40 ${
                    mounted && resolvedTheme === 'dark' ? 'bg-zinc-900 border-zinc-700/50' : 'bg-zinc-100 border-border'
                  }`}
                  value={desktopSearchQuery}
                  onChange={(e) => setDesktopSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchResults && searchResults.length > 0 && desktopSearchQuery.length > 1) {
                      setIsDesktopSearchOpen(true);
                    }
                  }}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 mt-1" align="start">
              {renderSearchResults(debouncedDesktopSearchQuery, searchResults, isSearchLoading && desktopSearchQuery.length > 1, closeDesktopSearch)}
            </PopoverContent>
          </Popover>
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
              <Link href={`/profile/${user?.username ?? ''}`}>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                 <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.image ?? undefined} />
                    <AvatarFallback>
                      {user?.name ? user.name[0] : <User className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
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
      
      {/* Mobile Search Bar */}
      <div className="md:hidden py-2 px-4">
        <Popover open={isMobileSearchOpen} onOpenChange={setIsMobileSearchOpen}>
          <PopoverTrigger asChild>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className={`w-full pl-10 h-9 border ${
                    mounted && resolvedTheme === 'dark' ? 'bg-muted/40' : 'bg-zinc-100 border-border'
                }`}
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults && searchResults.length > 0 && mobileSearchQuery.length > 1) {
                    setIsMobileSearchOpen(true);
                  }
                }}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[calc(100vw-2rem)] p-0 mt-1" align="center">
             {renderSearchResults(debouncedMobileSearchQuery, searchResults, isSearchLoading && mobileSearchQuery.length > 1, closeMobileSearch)}
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
} 