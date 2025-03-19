"use client";

import { usePathname } from "next/navigation";
import { Header1 } from "@/components/ui/header";
import { AppSidebar } from "@/components/app-sidebar";
import RightSidebar from "@/components/right-sidebar";
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
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <Header1 />
        <main className="flex-1 overflow-auto">
          <div className="container max-w-[1400px] mx-auto py-4 md:py-6 px-2 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="lg:col-span-3">
                {children}
              </div>
              <div className="hidden lg:block">
                <RightSidebar />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 