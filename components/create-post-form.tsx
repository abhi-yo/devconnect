"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { trpc } from "@/lib/trpc/client"
import { useToast } from "@/components/ui/use-toast"

export default function CreatePostForm() {
  const [content, setContent] = useState("")
  const { data: session } = useSession()
  const { toast } = useToast()

  const utils = trpc.useContext()

  const { mutate: createPost, isLoading } = trpc.post.create.useMutation({
    onSuccess: () => {
      setContent("")
      utils.post.getInfiniteFeed.invalidate()
      toast({
        title: "Success",
        description: "Your post has been published",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to create a post",
        variant: "destructive",
      })
      return
    }

    if (!content.trim()) return

    createPost({ content })
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="p-1.5 md:p-2">
          <div className="flex gap-2">
            <Avatar className="h-8 w-8 md:h-9 md:w-9">
              <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
              <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[50px] text-sm"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between px-1.5 md:px-2 pb-1.5 md:pb-2 pt-0">
          <div className="flex gap-2">{/* Add attachment buttons here if needed */}</div>
          <Button type="submit" size="sm" className="rounded-full" disabled={!content.trim() || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Posting...
              </>
            ) : (
              "Post"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

