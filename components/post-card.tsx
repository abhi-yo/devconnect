"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Heart, MessageSquare, Share2, MoreHorizontal, Loader2, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { trpc } from "@/lib/trpc/client"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface PostCardProps {
  post: {
    id: string
    content: string
    createdAt: Date
    author: {
      id: string
      name: string
      username: string
      image: string | null
    }
    _count: {
      likes: number
      comments: number
    }
    likedByMe: boolean
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  
  return `${Math.floor(diffInMonths / 12)}y ago`;
}

export default function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const editTextareaRef = useRef<HTMLTextAreaElement>(null)
  const { data: session } = useSession()
  const { toast } = useToast()

  const utils = trpc.useContext()

  useEffect(() => {
    if (isEditing && editTextareaRef.current) {
      editTextareaRef.current.focus()
      const length = editTextareaRef.current.value.length
      editTextareaRef.current.setSelectionRange(length, length)
    }
  }, [isEditing])

  const { mutate: toggleLike, isLoading: isLikeLoading } = trpc.post.toggleLike.useMutation({
    onSuccess: () => {
      utils.post.getInfiniteFeed.invalidate()
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      })
    },
  })

  const { mutate: deletePost, isLoading: isDeleteLoading } = trpc.post.deletePost.useMutation({
    onSuccess: () => {
      utils.post.getInfiniteFeed.invalidate()
      toast({
        title: "Success",
        description: "Post deleted successfully",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post. Please try again.",
        variant: "destructive",
      })
    },
  })

  const { mutate: addComment, isLoading: isCommentLoading } = trpc.post.addComment.useMutation({
    onSuccess: () => {
      setCommentText("")
      utils.post.getInfiniteFeed.invalidate()
      utils.post.getComments.invalidate({ postId: post.id })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    },
  })

  const { mutate: editPost, isLoading: isEditLoading } = trpc.post.editPost.useMutation({
    onSuccess: (updatedPost) => {
      setIsEditing(false)
      utils.post.getInfiniteFeed.invalidate()
      toast({
        title: "Success",
        description: "Post updated successfully",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update post. Please try again.",
        variant: "destructive",
      })
    },
  })

  const { data: comments, isLoading: isCommentsLoading } = trpc.post.getComments.useQuery(
    { postId: post.id },
    { enabled: showComments },
  )

  const { mutate: deleteComment, isLoading: isDeleteCommentLoading } = trpc.post.deleteComment.useMutation({
    onSuccess: (data) => {
      utils.post.getComments.invalidate({ postId: data.postId })
      utils.post.getInfiniteFeed.invalidate()
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment. Please try again.",
        variant: "destructive",
      })
    },
  })

  const handleToggleLike = () => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to like posts",
        variant: "destructive",
      })
      return
    }

    toggleLike({ postId: post.id })
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to comment",
        variant: "destructive",
      })
      return
    }

    if (!commentText.trim()) return

    addComment({
      postId: post.id,
      content: commentText,
    })
  }

  const handleEditPost = () => {
    if (!session) return
    
    if (!editContent.trim()) {
      toast({
        title: "Error",
        description: "Post content cannot be empty",
        variant: "destructive",
      })
      return
    }

    editPost({
      postId: post.id,
      content: editContent,
    })
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditContent(post.content)
  }

  const handleStartEdit = () => {
    setIsEditing(true)
    setEditContent(post.content)
  }

  const handleDeletePost = () => {
    if (!session) return
    deletePost({ postId: post.id })
  }

  const handleDeleteComment = (commentId: string) => {
    if (!session) return
    deleteComment({ commentId })
  }

  return (
    <Card className="card-hover overflow-hidden border-border/40 animate-fade-in hover:border-primary/20">
      <CardHeader className="flex flex-row items-start gap-2 space-y-0 p-1.5 md:p-2">
        <Link href={`/profile/${post.author.username}`}>
          <Avatar className="h-8 w-8 md:h-9 md:w-9 border shadow-sm">
            <AvatarImage src={post.author.image || ""} alt={post.author.name} />
            <AvatarFallback className="bg-primary/10 text-primary">{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <Link href={`/profile/${post.author.username}`} className="font-semibold hover:underline text-sm">
                {post.author.name}
              </Link>
              <Link href={`/profile/${post.author.username}`} className="ml-1 text-xs text-muted-foreground hover:underline">
                @{post.author.username}
              </Link>
              <span className="text-xs text-muted-foreground">
                {" · "}
                {getTimeAgo(new Date(post.createdAt))}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full hover:bg-muted">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem className="cursor-pointer">
                  Copy link
                </DropdownMenuItem>
                {session?.user && (session.user as SessionUser).id === post.author.id && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleStartEdit} className="cursor-pointer">
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                      disabled={isDeleteLoading}
                      onClick={handleDeletePost}
                    >
                      {isDeleteLoading ? "Deleting..." : "Delete"}
                    </DropdownMenuItem>
                  </>
                )}
                {session?.user && (session.user as SessionUser).id !== post.author.id && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                      Report
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <Textarea
                ref={editTextareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px] resize-none focus-visible:ring-primary"
                placeholder="What's on your mind?"
                maxLength={500}
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancelEdit}
                  disabled={isEditLoading}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleEditPost}
                  disabled={isEditLoading || !editContent.trim()}
                  className="rounded-full"
                >
                  {isEditLoading ? 
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 
                    "Save"
                  }
                </Button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words text-sm mt-1">{post.content}</p>
          )}
        </div>
      </CardHeader>
      <CardFooter className="flex flex-col space-y-3 p-1.5 md:p-2 pt-0">
        <div className="flex items-center justify-between border-t border-border/40 pt-2 -mx-1">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 px-2 rounded-full"
              onClick={handleToggleLike}
              disabled={isLikeLoading}
            >
              <Heart
                className={cn("h-4 w-4 transition-all", 
                  post.likedByMe ? 
                  "fill-red-500 text-red-500 scale-110" : 
                  "text-muted-foreground hover:text-primary"
                )}
              />
              <span className="text-xs font-medium">{post._count.likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 px-2 rounded-full"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquare className={cn("h-4 w-4 transition-colors", showComments ? "text-primary" : "text-muted-foreground hover:text-primary")} />
              <span className="text-xs font-medium">{post._count.comments}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2 rounded-full">
              <Share2 className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
            </Button>
          </div>
        </div>

        {showComments && (
          <div className="space-y-2 pt-1 animate-fade-in">
            <form onSubmit={handleAddComment} className="flex gap-2">
              <Textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[50px] flex-1 resize-none focus-visible:ring-primary text-sm"
              />
              <Button 
                type="submit" 
                size="sm" 
                className="self-end rounded-full" 
                disabled={!commentText.trim() || isCommentLoading}
              >
                {isCommentLoading ? 
                  <Loader2 className="h-4 w-4 animate-spin" /> : 
                  "Post"
                }
              </Button>
            </form>

            <div className="space-y-2">
              {isCommentsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2 animate-fade-in">
                    <Link href={`/profile/${comment.author.username}`}>
                      <Avatar className="h-7 w-7 md:h-8 md:w-8 border shadow-sm">
                        <AvatarImage src={comment.author.image || ""} alt={comment.author.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">{comment.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1 rounded-lg bg-muted/50 p-2 md:p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Link href={`/profile/${comment.author.username}`} className="font-semibold hover:underline text-xs md:text-sm">
                            {comment.author.name}
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            {getTimeAgo(new Date(comment.createdAt))}
                          </span>
                        </div>
                        {session?.user && (session.user as SessionUser).id === comment.author.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 md:h-6 md:w-6 p-0 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={isDeleteCommentLoading}
                          >
                            <Trash2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
                            <span className="sr-only">Delete comment</span>
                          </Button>
                        )}
                      </div>
                      <p className="mt-1 text-xs md:text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-xs md:text-sm text-muted-foreground">No comments yet</p>
              )}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

