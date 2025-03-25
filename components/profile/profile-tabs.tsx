"use client"

import { useEffect, useRef, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PostCard from "@/components/post-card"
import { trpc } from "@/lib/trpc/client"
import { Loader2 } from "lucide-react"
import { useInView } from "react-intersection-observer"

interface ProfileTabsProps {
  user: {
    id: string
    username: string
  }
  isCurrentUser: boolean
}

export default function ProfileTabs({ user, isCurrentUser }: ProfileTabsProps) {
  const { ref: loadMoreRef, inView } = useInView()
  const [activeTab, setActiveTab] = useState("posts")

  const {
    data: postsData,
    isLoading: isPostsLoading,
    fetchNextPage: fetchNextPosts,
    hasNextPage: hasNextPosts,
    isFetchingNextPage: isFetchingNextPosts,
  } = trpc.post.getUserPosts.useInfiniteQuery(
    {
      userId: user.id,
      limit: 10,
    },
    {
      enabled: activeTab === "posts",
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  )

  const {
    data: likedPostsData,
    isLoading: isLikedPostsLoading,
    fetchNextPage: fetchNextLikedPosts,
    hasNextPage: hasNextLikedPosts,
    isFetchingNextPage: isFetchingNextLikedPosts,
  } = trpc.post.getUserLikedPosts.useInfiniteQuery(
    {
      userId: user.id,
      limit: 10,
    },
    {
      enabled: activeTab === "likes",
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  )

  useEffect(() => {
    if (inView) {
      if (activeTab === "posts" && hasNextPosts) {
        fetchNextPosts()
      } else if (activeTab === "likes" && hasNextLikedPosts) {
        fetchNextLikedPosts()
      }
    }
  }, [inView, activeTab, fetchNextPosts, fetchNextLikedPosts, hasNextPosts, hasNextLikedPosts])

  const posts = postsData?.pages.flatMap((page) => page.items) ?? []
  const likedPosts = likedPostsData?.pages.flatMap((page) => page.items) ?? []

  return (
    <Tabs defaultValue="posts" onValueChange={setActiveTab} className="h-full flex flex-col">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="replies">Replies</TabsTrigger>
        <TabsTrigger value="likes">Likes</TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="flex-1 mt-4 overflow-y-auto">
        <div className="space-y-6 pb-4">
          {isPostsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : posts.length > 0 ? (
            <>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
              {hasNextPosts && (
                <div ref={loadMoreRef} className="flex justify-center py-4">
                  {isFetchingNextPosts ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : null}
                </div>
              )}
            </>
          ) : (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">
                {isCurrentUser ? "You haven't posted anything yet" : `${user.username} hasn't posted anything yet`}
              </p>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="replies" className="flex-1 mt-4 overflow-y-auto">
        <div className="space-y-6 pb-4">
          <div className="py-10 text-center">
            <p className="text-muted-foreground">
              {isCurrentUser
                ? "You haven't replied to any posts yet"
                : `${user.username} hasn't replied to any posts yet`}
            </p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="likes" className="flex-1 mt-4 overflow-y-auto">
        <div className="space-y-6 pb-4">
          {isLikedPostsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : likedPosts.length > 0 ? (
            <>
              {likedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
              {hasNextLikedPosts && (
                <div ref={loadMoreRef} className="flex justify-center py-4">
                  {isFetchingNextLikedPosts ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : null}
                </div>
              )}
            </>
          ) : (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">
                {isCurrentUser ? "You haven't liked any posts yet" : `${user.username} hasn't liked any posts yet`}
              </p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}

