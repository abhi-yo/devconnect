'use client'

import { ThemeProvider } from "@/app/providers/ThemeProvider"
import { SessionProvider } from "next-auth/react"
import { TRPCProvider } from "@/lib/trpc/Provider"
import { SidebarProvider } from "@/components/ui/sidebar"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <TRPCProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </TRPCProvider>
      </ThemeProvider>
    </SessionProvider>
  )
} 