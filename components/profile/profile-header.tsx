"use client"

import { useState } from "react"
import { Pencil, Camera, Loader2, MapPin, Link2, Calendar } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { trpc } from "@/lib/trpc/client"
import { useToast } from "@/components/ui/use-toast"
import { StartChatButton } from "@/components/chat/StartChatButton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

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
  _count?: {
    following: number
    followers: number
  }
}

interface ProfileHeaderProps {
  user: User
  isCurrentUser: boolean
  isFollowing: boolean
  isFollowLoading: boolean
  handleToggleFollow: () => void
}

export default function ProfileHeader({ user, isCurrentUser, isFollowing, isFollowLoading, handleToggleFollow }: ProfileHeaderProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState(user.image || "")
  const [bannerUrl, setBannerUrl] = useState(user.profile?.banner || "")
  const { toast } = useToast()

  const utils = trpc.useContext()

  const { mutate: updateProfile, isLoading: isUpdateLoading } = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile images have been updated successfully.",
      })
      setIsEditDialogOpen(false)
      utils.user.getSettings.invalidate()
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile images. Please try again.",
        variant: "destructive",
      })
    },
  })

  const handleUpdateImages = () => {
    updateProfile({
      name: user.name,
      bio: user.profile?.bio || null,
      location: user.profile?.location || null,
      website: user.profile?.website || null,
      github: user.profile?.github || null,
      twitter: user.profile?.twitter || null,
      image: imageUrl || null,
      banner: bannerUrl || null,
    })
  }

  return (
    <div className="relative">
      <div
        className="h-48 w-full bg-gradient-to-r from-primary/20 to-primary/40"
        style={{
          backgroundImage: bannerUrl ? `url(${bannerUrl})` : user.profile?.banner ? `url(${user.profile.banner})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {isCurrentUser && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 bg-background/80 hover:bg-background"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Camera className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="absolute left-4 top-32 z-10">
        <Avatar className="h-32 w-32 border-4 border-background">
          <AvatarImage src={imageUrl || user.image || ""} alt={user.name} />
          <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        {isCurrentUser && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-0 right-0 rounded-full bg-background shadow-sm hover:bg-accent"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Camera className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex justify-end p-4">
        {isCurrentUser ? (
          <Button variant="outline" size="sm" asChild>
            <a href="/settings">
              <Pencil className="mr-2 h-4 w-4" />
              Edit profile
            </a>
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant={isFollowing ? "outline" : "default"}
              size="sm"
              onClick={handleToggleFollow}
              disabled={isFollowLoading}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </Button>
            <StartChatButton targetUserId={user.id} />
          </div>
        )}
      </div>

      <div className="px-4 pb-4 pt-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-background shadow-sm">
              <AvatarImage src={user.image || ""} alt={user.name || ""} />
              <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h1 className="text-4xl font-heading font-bold tracking-tight">{user.name}</h1>
              <p className="text-[14px] text-muted-foreground">@{user.username}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-[14px]">{user.profile?.location || "No location"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              <Link href={user.profile?.website || "#"} className="text-[14px] text-primary hover:underline">
                {user.profile?.website?.replace(/^https?:\/\//, "") || "No website"}
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-[14px]">Joined {formatDate(user.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="text-[14px] font-medium">{user._count?.following}</span>
              <span className="text-[14px] text-muted-foreground">Following</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[14px] font-medium">{user._count?.followers}</span>
              <span className="text-[14px] text-muted-foreground">Followers</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCurrentUser ? (
              <Button variant="outline" size="sm" asChild>
                <Link href="/settings" className="text-[12px]">Edit profile</Link>
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant={isFollowing ? "outline" : "default"}
                  size="sm"
                  onClick={handleToggleFollow}
                  disabled={isFollowLoading}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </Button>
                <StartChatButton targetUserId={user.id} />
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile Images</DialogTitle>
            <DialogDescription>
              Update your profile picture and banner image. Enter the URLs for your images.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="avatar">Profile Picture URL</Label>
              <Input
                id="avatar"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner">Banner Image URL</Label>
              <Input
                id="banner"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://example.com/banner.jpg"
              />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateImages} disabled={isUpdateLoading}>
              {isUpdateLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

