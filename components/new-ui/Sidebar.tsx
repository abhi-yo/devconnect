"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Compass, 
  MessageSquare, 
  Bell, 
  Settings, 
  User,
  PlusCircle,
  LogOut
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = "" }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  // Navigation items
  const navItems = [
    { title: "Home", href: "/", icon: Home },
    { title: "Explore", href: "/explore", icon: Compass },
    { title: "Notifications", href: "/notifications", icon: Bell },
    { title: "Profile", href: "/profile", icon: User },
    { title: "Settings", href: "/settings", icon: Settings },
  ];
  
  if (!session) return null;
  
  return (
    <aside className={`pt-6 pb-4 flex flex-col h-screen ${className}`}>
      {/* DevConnect Logo */}
      <div className="px-4 -mt-2">
        <Link href="/" className="flex items-center gap-1">
          <div className="h-10 w-12 flex items-center justify-center">
            <Image 
              src="/logo.png" 
              alt="DevConnect Logo" 
              width={40} 
              height={40}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold font-['Space_Grotesk'] text-white">DevConnect</h1>
        </Link>
      </div>
      
      {/* Add extra spacing here to push navigation items down */}
      <div className="mt-6"></div>
      
      {/* Main Navigation */}
      <nav className="flex-1 space-y-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 h-11 mb-1 font-medium text-base ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted/60'}`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                {item.title}
              </Button>
            </Link>
          );
        })}
      </nav>
      
      {/* Create Post Button */}
      <div className="px-4 mt-4 mb-8">
        <Button className="w-full gap-2 justify-center py-5 font-medium" asChild>
          <Link href="/create-post">
            <PlusCircle className="h-5 w-5" />
            Create Post
          </Link>
        </Button>
      </div>
      
      {/* User Section */}
      <div className="border-t border-border mt-auto pt-4 px-4">
        {session && (
          <div className="flex items-center gap-3 px-3 py-3 mb-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {session.user?.image ? (
                <img 
                  src={session.user.image} 
                  alt={session.user?.name || "User"} 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {session.user?.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session.user?.email || ""}
              </p>
            </div>
          </div>
        )}
        
        <Link href="#" onClick={(e) => {
          e.preventDefault();
          signOut({ callbackUrl: "/" });
        }}>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive mt-1"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </Link>
      </div>
    </aside>
  );
} 