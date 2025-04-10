"use client"

import { useState } from "react"
import { trpc } from "@/lib/trpc/client"
import ProfileHeader from "@/components/profile/profile-header"
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: string
  name: string
  username: string
  image: string | null
  createdAt: Date
  profile: {
    bio: string | null
    location: string | null
    website: string | null
    github: string | null
    twitter: string | null
    banner: string | null
  } | null
  _count: {
    following: number
    followers: number
  }
}

interface ClientProfilePageProps {
  user: User
  isCurrentUser: boolean
  initialIsFollowing: boolean
}

export default function ClientProfilePage({ user, isCurrentUser, initialIsFollowing }: ClientProfilePageProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const { toast } = useToast()
  const utils = trpc.useContext()

  const { mutate: toggleFollow, isLoading: isFollowLoading } = trpc.user.toggleFollow.useMutation({
    onSuccess: ({ following }) => {
      setIsFollowing(following)
      utils.user.invalidate()
      toast({
        title: following ? "Followed successfully" : "Unfollowed successfully",
        description: following ? `You are now following ${user.name}` : `You have unfollowed ${user.name}`,
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update follow status. Please try again.",
        variant: "destructive",
      })
    },
  })

  const handleToggleFollow = () => {
    if (!isCurrentUser) {
      toggleFollow({ userId: user.id })
    }
  }

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      <ProfileHeader
        user={user}
        isCurrentUser={isCurrentUser}
        isFollowing={isFollowing}
        isFollowLoading={isFollowLoading}
        handleToggleFollow={handleToggleFollow}
      />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4">
          {/* You can add other profile content here */}
          <div className="text-center text-muted-foreground py-8">
            {isCurrentUser ? (
              "Share your thoughts and connect with other developers!"
            ) : (
              `View ${user.name}'s activity and contributions`
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 