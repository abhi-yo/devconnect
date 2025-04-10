"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import AuthLayout from "@/components/layouts/auth-layout"

function VerifyEmailContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (!token) {
          setStatus("error")
          setMessage("Missing verification token")
          return
        }

        const response = await fetch(`/api/auth/verify?token=${token}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message)
        }

        setStatus("success")
        setMessage("Email verified successfully!")

        // Redirect to sign in page after 3 seconds
        setTimeout(() => {
          router.push("/auth/signin")
        }, 3000)
      } catch (error) {
        setStatus("error")
        setMessage(error instanceof Error ? error.message : "Verification failed")
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div className="space-y-6 text-center">
      <h1 className="text-4xl font-heading font-bold tracking-tight">
        Email Verification
      </h1>

      <div className="flex flex-col items-center justify-center space-y-4">
        {status === "loading" && (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Verifying your email...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="rounded-full bg-green-500/10 p-3">
              <div className="rounded-full bg-green-500/20 p-2">
                <svg
                  className="h-6 w-6 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <p className="text-green-500 font-medium">{message}</p>
            <p className="text-sm text-muted-foreground">
              Redirecting to sign in page...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="rounded-full bg-red-500/10 p-3">
              <div className="rounded-full bg-red-500/20 p-2">
                <svg
                  className="h-6 w-6 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <p className="text-red-500 font-medium">{message}</p>
            <p className="text-sm text-muted-foreground">
              Please try signing up again or contact support if the problem
              persists.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmail() {
  return (
    <AuthLayout>
      <Suspense 
        fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </AuthLayout>
  )
} 