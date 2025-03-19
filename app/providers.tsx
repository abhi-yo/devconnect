'use client'

import { ThemeProvider } from "@/components/theme-provider"
import { SessionProvider } from "next-auth/react"
import { TRPCProvider } from "@/components/trpc-provider"
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