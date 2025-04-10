"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthPage = pathname?.startsWith('/auth') ?? false;
  const isLandingPage = pathname === '/landing';
  const isLoading = status === "loading";
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Add or remove auth-page class for specific styling
    if (isAuthPage) {
      document.body.classList.add('auth-page');
    } else {
      document.body.classList.remove('auth-page');
    }

    return () => {
      document.body.classList.remove('auth-page');
    };
  }, [isAuthPage]);

  // Add scroll event listener to detect when page is scrolled
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    // Add event listener for scroll
    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // For auth pages (login/register), use a centered layout
  if (isAuthPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    );
  }

  // For landing page or unauthenticated users (except auth pages)
  if (isLandingPage || (!session && !isAuthPage && !isLoading)) {
    return <>{children}</>;
  }

  // Main application layout with header and sidebar for authenticated users
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      {/* Fixed sidebar for desktop */}
      <div className="hidden md:block w-64 shrink-0">
        <div className="fixed top-0 bottom-0 w-64 border-r border-border/40">
          <Sidebar className="h-screen" />
        </div>
      </div>
      
      <div className="flex-1 flex flex-col w-full">
        {/* Sticky header with blur effect when scrolled */}
        <div className={`sticky top-0 z-40 ${isScrolled ? 'bg-background/80 backdrop-blur-sm' : 'bg-background'} transition-all duration-200`}>
          <Header />
        </div>
        
        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto w-full px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 