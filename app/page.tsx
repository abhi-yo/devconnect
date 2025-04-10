"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Landing from "@/app/landing/page";
import { HomePage } from "@/components/new-ui/HomePage";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Show loading state
  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Show landing page for unauthenticated users
  if (status === "unauthenticated") {
    return <Landing />;
  }

  // Show homepage for authenticated users
  return <HomePage />;
}

