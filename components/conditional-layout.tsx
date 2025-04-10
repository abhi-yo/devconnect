"use client";

import { usePathname } from "next/navigation";
import { SimpleHeader } from "@/components/SimpleHeader";
import { AppSidebar } from "@/components/app-sidebar";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAuthPage = pathname?.startsWith('/auth') ?? false;
  const isLandingPage = pathname === '/landing';

  useEffect(() => {
    if (isAuthPage) {
      document.body.classList.add('auth-page');
    } else {
      document.body.classList.remove('auth-page');
    }

    return () => {
      document.body.classList.remove('auth-page');
    };
  }, [isAuthPage]);

  // For auth pages, center the content in the middle of the screen
  if (isAuthPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    );
  }

  // For the landing page or when no session (except auth pages)
  if (isLandingPage || (!session && !isAuthPage)) {
    return <>{children}</>;
  }

  // For regular pages with authentication, render the full layout with navigation
  return (
    <div className="flex min-h-screen bg-background">
      <div className="border-r border-border/40">
        <AppSidebar /> 
      </div>
      
      <div className="flex-1 flex flex-col w-full">
        <SimpleHeader />
        <main className="flex-1 overflow-auto">
          <div className="w-full px-4 md:px-6 py-4 md:py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 