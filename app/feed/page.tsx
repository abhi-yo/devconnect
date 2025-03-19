"use client"

import { useSession } from "next-auth/react"
import CreatePostForm from "@/components/create-post-form"
import PostFeed from "@/components/post-feed"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function FeedPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/landing")
    }
  }, [status, router])

  if (status === "loading") return null

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-2xl space-y-6">
        <CreatePostForm />
        <PostFeed />
      </div>
    </main>
  )
} 