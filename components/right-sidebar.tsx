"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { trpc } from "@/lib/trpc/client"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

export default function RightSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const { data: suggestedUsers, isLoading } = trpc.user.getSuggestedUsers.useQuery()
  const { data: trendingTopics } = trpc.topic.getTrending.useQuery()
  const { toast } = useToast()
  const utils = trpc.useContext()

  const { mutate: toggleFollow, isLoading: isFollowLoading } = trpc.user.toggleFollow.useMutation({
    onSuccess: ({ following }, { userId }) => {
      utils.user.getSuggestedUsers.invalidate()
      const user = suggestedUsers?.find(u => u.id === userId)
      if (user) {
        toast({
          title: following ? "Followed successfully" : "Unfollowed successfully",
          description: following ? `You are now following ${user.name}` : `You have unfollowed ${user.name}`,
        })
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update follow status. Please try again.",
        variant: "destructive",
      })
    },
  })

  return (
    <div className={cn("space-y-4 md:space-y-6", isMobile && "pb-4")}>
      <Card className={cn(isMobile && "border-0 shadow-none bg-transparent")}>
        <CardHeader className="pb-1 md:pb-2">
          <CardTitle className="card-heading">Who to follow</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:gap-4 pt-2">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : suggestedUsers && suggestedUsers.length > 0 ? (
            suggestedUsers.slice(0, isMobile ? 2 : 3).map((user) => (
              <div key={user.id} className="flex items-center justify-between gap-3 md:gap-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <Avatar className="h-8 w-8 md:h-9 md:w-9">
                    <AvatarImage src={user.image || ""} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-0.5">
                    <Link href={`/profile/${user.username}`} className="text-sm font-medium hover:underline">
                      {user.name}
                    </Link>
                    <span className="text-xs text-muted-foreground">@{user.username}</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 rounded-full"
                  onClick={() => toggleFollow({ userId: user.id })}
                  disabled={isFollowLoading}
                >
                  Follow
                </Button>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-muted-foreground">No suggestions available</p>
          )}

          <Button variant="ghost" size="sm" className="w-full justify-center rounded-full" asChild>
            <Link href="/explore/people">Show more</Link>
          </Button>
        </CardContent>
      </Card>

      {trendingTopics && trendingTopics.length > 0 && (
        <Card className={cn(isMobile && "border-0 shadow-none bg-transparent")}>
          <CardHeader className="pb-1 md:pb-2">
            <CardTitle className="card-heading">Trending topics</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:gap-4 pt-2">
            {trendingTopics.slice(0, isMobile ? 3 : 5).map((topic) => (
              <Link
                key={topic.id}
                href={`/topic/${topic.slug}`}
                className="group grid gap-0.5"
              >
                <span className="text-sm font-medium group-hover:underline">
                  #{topic.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {topic.postCount} posts
                </span>
              </Link>
            ))}
            <Button variant="ghost" size="sm" className="w-full justify-center rounded-full" asChild>
              <Link href="/explore/topics">Show more</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

