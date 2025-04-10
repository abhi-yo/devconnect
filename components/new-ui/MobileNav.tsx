"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  Home, 
  Compass, 
  MessageSquare, 
  Bell, 
  Settings, 
  User,
  PlusCircle,
  LogOut
} from "lucide-react";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  // Array of navigation items
  const navItems = [
    { title: "Home", href: "/", icon: Home },
    { title: "Explore", href: "/explore", icon: Compass },
    { title: "Notifications", href: "/notifications", icon: Bell },
    { title: "Create Post", href: "/create-post", icon: PlusCircle },
    { title: "Profile", href: "/profile", icon: User },
    { title: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <div className="border-b border-border py-4 px-6">
          <p className="text-sm text-muted-foreground">
            {session ? `Signed in as ${session.user?.name}` : "Welcome"}
          </p>
        </div>
        
        <div className="py-4">
          {session ? (
            <nav className="flex flex-col space-y-1 px-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setOpen(false)}
                  >
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className="w-full justify-start gap-3 h-10"
                    >
                      <Icon className="h-5 w-5" />
                      {item.title}
                    </Button>
                  </Link>
                );
              })}
              
              <Link href="#" onClick={(e) => {
                e.preventDefault();
                setOpen(false);
                signOut({ callbackUrl: "/" });
              }}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 h-10 mt-4 text-destructive"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </Button>
              </Link>
            </nav>
          ) : (
            <div className="flex flex-col gap-2 px-6">
              <Button asChild size="lg" className="w-full">
                <Link href="/auth/signin" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link href="/auth/signup" onClick={() => setOpen(false)}>
                  Create account
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
} 