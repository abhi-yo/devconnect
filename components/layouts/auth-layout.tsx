import type React from "react"

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-[400px]">
        <div className="bg-card border rounded-xl shadow-sm p-8">
          {children}
        </div>
      </div>
    </div>
  )
}

