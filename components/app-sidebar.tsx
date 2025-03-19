"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { 
  Home, 
  Search, 
  MessageSquare, 
  Bell, 
  User, 
  Settings, 
  Users, 
  Hash,
  Code,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AppSidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const { state } = useSidebar()

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/explore", label: "Explore", icon: Search },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: `/profile/${session?.user?.email?.split('@')[0] || ""}`, label: "Profile", icon: User },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  const communities = [
    { href: "/communities/javascript", label: "JavaScript", icon: Hash },
    { href: "/communities/react", label: "React", icon: Hash },
    { href: "/communities/nextjs", label: "Next.js", icon: Hash },
    { href: "/communities/typescript", label: "TypeScript", icon: Hash },
  ]

  return (
    <Sidebar variant="sidebar" collapsible="none">
      <SidebarHeader className="border-b py-3">
        <div className="flex items-center px-2">
          <Link href="/" className="flex items-center">
            <span className="font-heading text-lg font-bold">DevConnect</span>
          </Link>
        </div>
        
        {session && (
          <div className="mt-4 flex items-center gap-3 px-2">
            <Avatar className="h-9 w-9 border shadow-sm">
              <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
              <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="username">{session.user?.name}</span>
              <span className="text-[12px] text-muted-foreground">@{session.user?.email?.split('@')[0]}</span>
            </div>
          </div>
        )}
      </SidebarHeader>
      
      <SidebarContent className="px-1 py-2">
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={cn(
                      "transition-all duration-200",
                      isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                    )}
                  >
                    <Link href={item.href} className="flex items-center">
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="ml-2 nav-item">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
            
            {session && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-all duration-200"
                  onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                >
                  <button className="w-full flex items-center">
                    <LogOut className="h-4 w-4 flex-shrink-0" />
                    <span className="ml-2 nav-item">Sign out</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
        
        <SidebarSeparator className="my-2" />
        
        <SidebarGroup>
          <SidebarGroupLabel className="card-heading px-2">Communities</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communities.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "transition-all duration-200",
                        isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                      )}
                    >
                      <Link href={item.href} className="flex items-center">
                        <div className="hashtag">#<span className="nav-item">{item.label}</span></div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="text-primary hover:bg-primary/10 transition-all duration-200"
                >
                  <Link href="/communities" className="flex items-center">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span className="ml-2 nav-item">Discover more</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
} 