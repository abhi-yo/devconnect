"use client"

import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { Loader2 } from "lucide-react"
import { trpc } from "@/lib/trpc/client"
import PostCard from "@/components/post-card"
import { useToast } from "@/components/ui/use-toast"

export default function PostFeed() {
  const { toast } = useToast()
  const { ref, inView } = useInView()

  const {
    data: posts,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = trpc.post.getInfiniteFeed.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to load posts. Please try again.",
          variant: "destructive",
        })
      },
    },
  )

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage])

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="py-10 text-center">
        <p className="text-destructive">Failed to load posts</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-primary hover:underline">
          Retry
        </button>
      </div>
    )
  }

  const allPosts = posts?.pages.flatMap((page) => page.items) || []

  if (allPosts.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-4">
      {allPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {hasNextPage && (
        <div ref={ref} className="flex justify-center py-4">
          {isFetchingNextPage ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : null}
        </div>
      )}
    </div>
  )
}

