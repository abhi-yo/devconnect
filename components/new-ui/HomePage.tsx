"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { User, Heart, MessageCircle, Share2, MoreHorizontal, Loader2, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

// Define types for our data
interface Author {
  id: string;
  name: string;
  username: string;
  image?: string;
}

interface Post {
  id: string;
  content: string;
  createdAt: string;
  author?: Author;
  likes?: number;
  comments?: number;
  likedByMe?: boolean;
}

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

// Helper function to get time ago
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
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

export function HomePage() {
  const { data: session } = useSession();
  const [postContent, setPostContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showCommentsFor, setShowCommentsFor] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const { toast } = useToast();
  const utils = trpc.useContext();

  // tRPC hooks
  const postsQuery = trpc.post.getInfiniteFeed.useQuery({ limit: 20 }, {
    onError: (error) => {
      console.error("Failed to fetch posts:", error);
    }
  });

  const createPostMutation = trpc.post.create.useMutation({
    onSuccess: () => {
      postsQuery.refetch();
      setPostContent("");
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error("Error creating post:", error);
      setIsSubmitting(false);
    }
  });

  const toggleLikeMutation = trpc.post.toggleLike.useMutation({
    onSuccess: () => {
      utils.post.getInfiniteFeed.invalidate();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deletePostMutation = trpc.post.deletePost.useMutation({
    onSuccess: () => {
      utils.post.getInfiniteFeed.invalidate();
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const editPostMutation = trpc.post.editPost.useMutation({
    onSuccess: () => {
      setEditingPostId(null);
      utils.post.getInfiniteFeed.invalidate();
      toast({
        title: "Success",
        description: "Post updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addCommentMutation = trpc.post.addComment.useMutation({
    onSuccess: () => {
      setCommentText("");
      utils.post.getInfiniteFeed.invalidate();
      utils.post.getComments.invalidate({ postId: showCommentsFor || "" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { data: comments, isLoading: isCommentsLoading } = trpc.post.getComments.useQuery(
    { postId: showCommentsFor || "" },
    { enabled: !!showCommentsFor },
  );

  // Handle Post Submit
  const handlePostSubmit = async () => {
    if (!postContent.trim() || !session) return;
    
    try {
      setIsSubmitting(true);
      createPostMutation.mutate({ content: postContent });
    } catch (error) {
      console.error("Error creating post:", error);
      setIsSubmitting(false);
    }
  };

  // Handle Like Toggle
  const handleToggleLike = (postId: string) => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to like posts",
        variant: "destructive",
      });
      return;
    }

    toggleLikeMutation.mutate({ postId });
  };

  // Handle Show Comments
  const handleToggleComments = (postId: string) => {
    if (showCommentsFor === postId) {
      setShowCommentsFor(null);
    } else {
      setShowCommentsFor(postId);
      setCommentText("");
    }
  };

  // Handle Post Delete
  const handleDeletePost = (postId: string) => {
    if (!session) return;
    deletePostMutation.mutate({ postId });
  };

  // Handle Post Edit
  const handleStartEditPost = (post: Post) => {
    setEditingPostId(post.id);
    setEditContent(post.content);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditContent("");
  };

  const handleSaveEdit = (postId: string) => {
    if (!session || !editContent.trim()) return;
    
    editPostMutation.mutate({
      postId,
      content: editContent,
    });
  };

  // Handle Comment Submit
  const handleAddComment = (e: React.FormEvent, postId: string) => {
    e.preventDefault();

    if (!session) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!commentText.trim()) return;

    addCommentMutation.mutate({
      postId,
      content: commentText,
    });
  };

  // Transform API response to Post[] format
  const posts: Post[] = [];
  
  if (postsQuery.data?.items) {
    postsQuery.data.items.forEach(item => {
      if (item) {
        try {
          const post: Post = {
            id: item.id || "",
            content: item.content || "",
            createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
            likes: item._count?.likes || 0,
            comments: item._count?.comments || 0,
            likedByMe: !!item.likedByMe
          };
          
          if (item.author) {
            post.author = {
              id: item.author.id,
              name: item.author.name,
              username: item.author.username,
              image: item.author.image || undefined
            };
          }
          
          posts.push(post);
        } catch (error) {
          console.error("Error processing post:", error);
        }
      }
    });
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Create Post Card */}
      {session && (
        <Card className="p-4 mb-6">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || "User"} />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="What's on your mind?"
                className="min-h-[120px] mb-3"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handlePostSubmit} 
                  disabled={!postContent.trim() || isSubmitting || createPostMutation.isLoading}
                >
                  {isSubmitting || createPostMutation.isLoading ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Feed Tabs */}
      <Tabs defaultValue="for-you" className="mb-6">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="for-you">For You</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>
        
        <TabsContent value="for-you" className="mt-4 space-y-4">
          {/* Loading State */}
          {postsQuery.isLoading && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Loading posts...</p>
            </Card>
          )}
          
          {/* Empty State */}
          {!postsQuery.isLoading && posts.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No posts to display</p>
            </Card>
          )}
          
          {/* Posts List */}
          {!postsQuery.isLoading && posts.map((post) => (
            <Card key={post.id} className="p-4 transition-all hover:border-muted">
              <div className="flex items-start gap-3">
                {post.author?.username ? (
                  <Link href={`/profile/${post.author.username}`}>
                    <Avatar className="h-10 w-10 border shadow-sm">
                      <AvatarImage src={post.author?.image || undefined} alt={post.author?.name || "User"} />
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                ) : (
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.author?.image || undefined} alt={post.author?.name || "User"} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      {post.author?.username ? (
                        <Link href={`/profile/${post.author.username}`} className="hover:underline">
                          <p className="font-semibold">{post.author?.name || "Anonymous"}</p>
                        </Link>
                      ) : (
                        <p className="font-semibold">{post.author?.name || "Anonymous"}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        @{post.author?.username || "user"} · {getTimeAgo(post.createdAt)}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem 
                          className="cursor-pointer flex items-center gap-2"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                            toast({
                              title: "Link copied",
                              description: "Post link copied to clipboard",
                            });
                          }}
                        >
                          <Share2 className="h-4 w-4" /> Copy link
                        </DropdownMenuItem>
                        {session?.user && (session.user as SessionUser).id === post.author?.id && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleStartEditPost(post)} 
                              className="cursor-pointer flex items-center gap-2 text-blue-500 focus:text-blue-500 focus:bg-blue-500/10"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer flex items-center gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                              disabled={deletePostMutation.isLoading}
                              onClick={() => handleDeletePost(post.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              {deletePostMutation.isLoading ? "Deleting..." : "Delete"}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {editingPostId === post.id ? (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[100px] resize-none focus-visible:ring-primary text-sm"
                        placeholder="What's on your mind?"
                        maxLength={500}
                      />
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleCancelEdit}
                          disabled={editPostMutation.isLoading}
                          className="rounded-lg h-9"
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleSaveEdit(post.id)}
                          disabled={editPostMutation.isLoading || !editContent.trim()}
                          className="rounded-lg h-9"
                        >
                          {editPostMutation.isLoading ? 
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 
                            "Save"
                          }
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 whitespace-pre-wrap">{post.content}</div>
                  )}
                  
                  <div className="flex items-center gap-6 mt-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn(
                        "flex items-center gap-1.5 px-3 rounded-lg h-9 text-muted-foreground",
                        post.likedByMe ? "text-red-500 hover:text-red-500 hover:bg-red-500/10" : "hover:text-red-500 hover:bg-red-500/10"
                      )}
                      onClick={() => handleToggleLike(post.id)}
                    >
                      <Heart className={cn("h-4 w-4 transition-colors", post.likedByMe ? "fill-red-500 text-red-500" : "")} />
                      <span className={cn("text-sm", post.likedByMe ? "text-red-500" : "")}>{post.likes || 0}</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn(
                        "flex items-center gap-1.5 px-3 rounded-lg h-9",
                        showCommentsFor === post.id ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                      )}
                      onClick={() => handleToggleComments(post.id)}
                    >
                      <MessageCircle className={cn("h-4 w-4 transition-colors", showCommentsFor === post.id ? "text-primary" : "")} />
                      <span className={cn("text-sm", showCommentsFor === post.id ? "text-primary" : "")}>{post.comments || 0}</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-1.5 px-3 rounded-lg h-9 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                        toast({
                          title: "Link copied",
                          description: "Post link copied to clipboard",
                        });
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {showCommentsFor === post.id && (
                    <div className="mt-4 pt-3 border-t border-border/20 space-y-3">
                      <form onSubmit={(e) => handleAddComment(e, post.id)} className="flex gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary">{session?.user?.name?.charAt(0) || "?"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex gap-2">
                          <Textarea
                            placeholder="Write a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="min-h-[40px] flex-1 resize-none focus-visible:ring-primary text-sm rounded-lg bg-muted/50"
                          />
                          <Button 
                            type="submit" 
                            size="sm" 
                            className="self-end rounded-lg h-9"
                            disabled={!commentText.trim() || addCommentMutation.isLoading}
                          >
                            {addCommentMutation.isLoading ? 
                              <Loader2 className="h-4 w-4 animate-spin" /> : 
                              "Post"
                            }
                          </Button>
                        </div>
                      </form>

                      <div className="space-y-3 pt-1">
                        {isCommentsLoading ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : comments && comments.length > 0 ? (
                          comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3 animate-fade-in">
                              <Link href={`/profile/${comment.author.username}`}>
                                <Avatar className="h-8 w-8 border shadow-sm flex-shrink-0">
                                  <AvatarImage src={comment.author.image || ""} alt={comment.author.name} />
                                  <AvatarFallback className="bg-primary/10 text-primary">{comment.author.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              </Link>
                              <div className="flex-1 rounded-lg bg-muted/50 p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Link href={`/profile/${comment.author.username}`} className="font-semibold hover:underline text-sm">
                                      {comment.author.name}
                                    </Link>
                                    <span className="text-xs text-muted-foreground">
                                      {getTimeAgo(new Date(comment.createdAt).toISOString())}
                                    </span>
                                  </div>
                                </div>
                                <p className="mt-1 text-sm">{comment.content}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-sm text-muted-foreground py-2">No comments yet</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="following" className="mt-4">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No posts from followed users
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 