"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { 
    Menu, 
    Search,
    MessageSquare,
    Bell,
    Plus,
    Sun,
    Moon
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";

function Header1() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-zinc-800/50 dark:border-zinc-800 bg-white dark:bg-black">
            <div className="container flex h-16 items-center px-8">
                <div className="md:hidden">
                    <SidebarTrigger className="-ml-2 mr-4" />
                </div>
                
                <div className="flex-1 flex items-center justify-center max-w-3xl mx-auto">
                    <div className="relative w-full hidden md:block">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <Input 
                            type="search" 
                            placeholder="Search developers, posts, topics..." 
                            className="w-full bg-zinc-100 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 pl-10 h-10 rounded-full text-[14px]" 
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {session ? (
                        <>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full relative hidden md:flex hover:bg-zinc-100 dark:hover:bg-zinc-800 ml-6">
                                <MessageSquare className="h-[18px] w-[18px] text-zinc-600 dark:text-zinc-400" />
                            </Button>
                            
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full relative hover:bg-zinc-100 dark:hover:bg-zinc-800 ">
                                <Bell className="h-[18px] w-[18px] text-zinc-600 dark:text-zinc-400" />
                                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-white">
                                    3
                                </div>
                            </Button>
                            
                            <Button variant="default" size="sm" className="rounded-full gap-1.5 hidden md:flex h-9 px-5 ml-1">
                                <Plus className="h-4 w-4" />
                                <span className="font-medium">Post</span>
                            </Button>

                            <Button variant="default" size="icon" className="rounded-full h-10 w-10 md:hidden">
                                <Plus className="h-[18px] w-[18px]" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            >
                                <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-zinc-600 dark:text-zinc-400" />
                                <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-zinc-600 dark:text-zinc-400" />
                                <span className="sr-only">Toggle theme</span>
                            </Button>
                        </>
                    ) : (
                        <Button asChild size="sm" className="rounded-full h-10 px-6">
                            <Link href="/auth/signin">Sign in</Link>
                        </Button>
                    )}
                </div>
            </div>
            
            {/* Mobile search bar */}
            <div className="md:hidden px-8 pb-4">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <Input 
                        type="search" 
                        placeholder="Search..." 
                        className="w-full bg-zinc-100 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 pl-10 h-10 rounded-full" 
                    />
                </div>
            </div>
        </header>
    );
}

export { Header1 };