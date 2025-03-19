"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

export default function Dashboard() {
  const { data: session, status } = useSession()

  if (status === "unauthenticated") {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-black dark:text-white">Dashboard</h1>
        {/* Your existing dashboard content goes here */}
      </div>
    </div>
  )
} 