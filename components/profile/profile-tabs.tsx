"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PostCard from "@/components/post-card"
import { trpc } from "@/lib/trpc/client"
import { Loader2 } from "lucide-react"

interface ProfileTabsProps {
  user: {
    id: string
    username: string
  }
  isCurrentUser: boolean
}

export default function ProfileTabs({ user, isCurrentUser }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("posts")

  const { data: posts, isLoading: isPostsLoading } = trpc.post.getUserPosts.useQuery(
    { userId: user.id },
    { enabled: activeTab === "posts" },
  )

  const { data: likedPosts, isLoading: isLikedPostsLoading } = trpc.post.getUserLikedPosts.useQuery(
    { userId: user.id },
    { enabled: activeTab === "likes" },
  )

  return (
    <Tabs defaultValue="posts" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="replies">Replies</TabsTrigger>
        <TabsTrigger value="likes">Likes</TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="mt-4 space-y-6">
        {isPostsLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : posts && posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="py-10 text-center">
            <p className="text-muted-foreground">
              {isCurrentUser ? "You haven't posted anything yet" : `${user.username} hasn't posted anything yet`}
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="replies" className="mt-4 space-y-6">
        <div className="py-10 text-center">
          <p className="text-muted-foreground">
            {isCurrentUser
              ? "You haven't replied to any posts yet"
              : `${user.username} hasn't replied to any posts yet`}
          </p>
        </div>
      </TabsContent>

      <TabsContent value="likes" className="mt-4 space-y-6">
        {isLikedPostsLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : likedPosts && likedPosts.length > 0 ? (
          likedPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="py-10 text-center">
            <p className="text-muted-foreground">
              {isCurrentUser ? "You haven't liked any posts yet" : `${user.username} hasn't liked any posts yet`}
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}

