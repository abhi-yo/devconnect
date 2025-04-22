"use client";

import { useState, useRef, useEffect } from "react";
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
  name: string | null;
  username: string;
  image?: string | null;
}

interface Post {
  id: string;
  content: string;
  createdAt: string;
  author?: Author;
  _count?: {
  likes?: number;
  comments?: number;
  };
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

// --- Refactored Post Card Component --- 
interface PostCardProps {
  post: Post;
  session: any; // Replace with actual Session type if available
  handleToggleLike: (postId: string) => void;
  handleToggleComments: (postId: string) => void;
  handleStartEditPost: (post: Post) => void;
  handleCancelEdit: () => void;
  handleSaveEdit: (postId: string) => void;
  handleDeletePost: (postId: string) => void;
  handleAddComment: (e: React.FormEvent, postId: string) => void;
  editingPostId: string | null;
  editContent: string;
  setEditContent: (content: string) => void;
  showCommentsFor: string | null;
  commentText: string;
  setCommentText: (text: string) => void;
  comments: any[] | undefined; // Replace 'any' with actual Comment type if defined
  isCommentsLoading: boolean;
  isEditLoading: boolean;
  isDeleteLoading: boolean;
  isCommentLoading: boolean;
    }

export function PostCard({ 
  post, 
  session,
  handleToggleLike,
  handleToggleComments,
  handleStartEditPost,
  handleCancelEdit,
  handleSaveEdit,
  handleDeletePost,
  handleAddComment,
  editingPostId,
  editContent,
  setEditContent,
  showCommentsFor,
  commentText,
  setCommentText,
  comments,
  isCommentsLoading,
  isEditLoading,
  isDeleteLoading,
  isCommentLoading
}: PostCardProps) {
  // Fetch comments specifically for this post if needed, or rely on parent
  // const { data: comments, isLoading: isCommentsLoading } = trpc.post.getComments.useQuery(
  //   { postId: post.id },
  //   { enabled: showCommentsFor === post.id }, // Only fetch when comments are shown for THIS post
  // );

  return (
    <Card className="p-4 transition-all hover:border-muted">
              <div className="flex items-start gap-3">
                {post.author?.username ? (
                  <Link href={`/profile/${post.author.username}`}>
                    <Avatar className="h-10 w-10 border shadow-sm">
                      <AvatarImage src={post.author?.image || undefined} alt={post.author?.name || "User"} />
              <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
                    </Avatar>
                  </Link>
                ) : (
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.author?.image || undefined} alt={post.author?.name || "User"} />
             <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
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
                    // Consider using toast passed via props if needed
                    // toast({ title: "Link copied", description: "Post link copied to clipboard" });
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
                      disabled={isDeleteLoading} // Use passed loading state
                              onClick={() => handleDeletePost(post.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                      {isDeleteLoading ? "Deleting..." : "Delete"} 
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
                  disabled={isEditLoading} // Use passed loading state
                          className="rounded-lg h-9"
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleSaveEdit(post.id)}
                  disabled={isEditLoading || !editContent.trim()} // Use passed loading state
                          className="rounded-lg h-9"
                        >
                  {isEditLoading ? // Use passed loading state
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
              <span className={cn("text-sm", post.likedByMe ? "text-red-500" : "")}>{post._count?.likes || 0}</span>
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
              <span className={cn("text-sm", showCommentsFor === post.id ? "text-primary" : "")}>{post._count?.comments || 0}</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-1.5 px-3 rounded-lg h-9 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                 // toast({ title: "Link copied", description: "Post link copied to clipboard" });
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
                    disabled={!commentText.trim() || isCommentLoading} // Use passed loading state
                          >
                    {isCommentLoading ? // Use passed loading state
                              <Loader2 className="h-4 w-4 animate-spin" /> : 
                              "Post"
                            }
                          </Button>
                        </div>
                      </form>

              {/* Comment list */}
              <div className="mt-4 space-y-4">
                        {isCommentsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading comments...</p>
                        ) : comments && comments.length > 0 ? (
                  comments.map((comment: any) => ( // Replace any with Comment type
                    <div key={comment.id} className="flex items-start gap-3">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={comment.author.image ?? undefined} alt={comment.author.name ?? comment.author.username} />
                        <AvatarFallback>
                          {(comment.author.name ?? comment.author.username ?? '-')[0].toUpperCase()}
                        </AvatarFallback>
                                </Avatar>
                      <div className="flex-1 bg-muted/50 px-3 py-2 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">{comment.author.name ?? comment.author.username}</span>
                                    <span className="text-xs text-muted-foreground">
                            {getTimeAgo(new Date(comment.createdAt instanceof Date ? comment.createdAt.toISOString() : comment.createdAt).toISOString())}
                                    </span>
                                  </div>
                        <p className="text-sm">{comment.content}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                  <p className="text-sm text-muted-foreground">No comments yet.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
  );
}

// --- Main Component --- 
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

  // tRPC hooks for feeds
  const forYouFeed = trpc.post.getInfiniteFeed.useInfiniteQuery(
    { limit: 10 }, 
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      onError: (error) => console.error("Failed to fetch For You feed:", error),
    }
  );

  const followingFeed = trpc.post.getFollowingPosts.useInfiniteQuery(
    { limit: 10 }, 
    {
      enabled: !!session, // Only run if user is logged in
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      onError: (error) => console.error("Failed to fetch Following feed:", error),
    }
  );

  // Extract posts from infinite query data
  const forYouPosts = forYouFeed.data?.pages.flatMap(page => page.items) ?? [];
  const followingPosts = followingFeed.data?.pages.flatMap(page => page.items) ?? [];

  // Transform data for PostCard
  const transformPostData = (item: any): Post => ({
    id: item.id,
    content: item.content,
    createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
    author: item.author,
    _count: item._count,
    likedByMe: item.likedByMe,
  });
  
  const transformedForYouPosts: Post[] = forYouPosts.map(transformPostData);
  const transformedFollowingPosts: Post[] = followingPosts.map(transformPostData);
  
  // --- Mutations --- 
  const createPostMutation = trpc.post.create.useMutation({
    onSuccess: () => {
      forYouFeed.refetch();
      followingFeed.refetch();
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
      utils.post.getFollowingPosts.invalidate();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to like post.", variant: "destructive" });
    },
  });

  const deletePostMutation = trpc.post.deletePost.useMutation({
    onSuccess: () => {
      utils.post.getInfiniteFeed.invalidate();
      utils.post.getFollowingPosts.invalidate();
      toast({ title: "Success", description: "Post deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message || "Failed to delete post.", variant: "destructive" });
    },
  });

  const editPostMutation = trpc.post.editPost.useMutation({
    onSuccess: () => {
      setEditingPostId(null);
      utils.post.getInfiniteFeed.invalidate();
      utils.post.getFollowingPosts.invalidate();
      toast({ title: "Success", description: "Post updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message || "Failed to update post.", variant: "destructive" });
    },
  });

  const addCommentMutation = trpc.post.addComment.useMutation({
    onSuccess: (data, variables) => {
      setCommentText("");
      utils.post.getInfiniteFeed.invalidate();
      utils.post.getFollowingPosts.invalidate();
      utils.post.getComments.invalidate({ postId: variables.postId });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add comment.", variant: "destructive" });
    },
  });

  // Comments query (potentially move inside PostCard if comments are fetched per-post)
  const { data: comments, isLoading: isCommentsLoading } = trpc.post.getComments.useQuery(
    { postId: showCommentsFor || "" },
    { enabled: !!showCommentsFor },
  );

  // --- Handlers --- 
  const handlePostSubmit = async () => {
    if (!postContent.trim() || !session) return;
    try {
      setIsSubmitting(true);
      createPostMutation.mutate({ content: postContent });
    } catch (error) { /* ... */ }
  };
  const handleToggleLike = (postId: string) => {
    if (!session) { /* ... */ return; }
    toggleLikeMutation.mutate({ postId });
  };
  const handleToggleComments = (postId: string) => {
    setShowCommentsFor(prev => prev === postId ? null : postId);
    setCommentText("");
  };
  const handleDeletePost = (postId: string) => {
    if (!session) return;
    deletePostMutation.mutate({ postId });
  };
  const handleStartEditPost = (post: Post) => {
    setEditingPostId(post.id);
    setEditContent(post.content ?? "");
  };
  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditContent("");
  };
  const handleSaveEdit = (postId: string) => {
    if (!session || !editContent.trim()) return;
    editPostMutation.mutate({ postId, content: editContent });
  };
  const handleAddComment = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!session) { /* ... */ return; }
    if (!commentText.trim()) return;
    addCommentMutation.mutate({ postId, content: commentText });
  };

  // Infinite scroll setup
  const observerTarget = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // TODO: Check active tab before fetching
          if (forYouFeed.hasNextPage && !forYouFeed.isFetchingNextPage) {
            forYouFeed.fetchNextPage();
          }
          if (followingFeed.hasNextPage && !followingFeed.isFetchingNextPage) {
            followingFeed.fetchNextPage();
          }
        }
      },
      { threshold: 1.0 } 
    );
    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }
    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [forYouFeed, followingFeed]); // Removed observerTarget from deps

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

      <Tabs defaultValue="for-you" className="mb-6">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="for-you">For You</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>
        
        <TabsContent value="for-you" className="mt-4 space-y-4">
          {/* Loading/Empty states using forYouFeed */}
          {transformedForYouPosts.map((post) => (
            <PostCard 
              key={`foryou-${post.id}`} 
              post={post} 
              session={session} 
              handleToggleLike={handleToggleLike}
              handleToggleComments={handleToggleComments}
              handleStartEditPost={handleStartEditPost}
              handleCancelEdit={handleCancelEdit}
              handleSaveEdit={handleSaveEdit}
              handleDeletePost={handleDeletePost}
              handleAddComment={handleAddComment}
              editingPostId={editingPostId}
              editContent={editContent}
              setEditContent={setEditContent}
              showCommentsFor={showCommentsFor}
              commentText={commentText}
              setCommentText={setCommentText}
              comments={comments?.filter(c => c.postId === post.id)} // Pass filtered comments
              isCommentsLoading={isCommentsLoading && showCommentsFor === post.id}
              isEditLoading={editPostMutation.isLoading && editingPostId === post.id}
              isDeleteLoading={deletePostMutation.isLoading}
              isCommentLoading={addCommentMutation.isLoading && showCommentsFor === post.id}
            />
          ))}
          {forYouFeed.hasNextPage && (
             <div ref={observerTarget} className="text-center p-4">
               {forYouFeed.isFetchingNextPage ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : "Load More"}
             </div>
          )}
        </TabsContent>
        
        <TabsContent value="following" className="mt-4 space-y-4">
          {/* Loading/Empty states using followingFeed */}
          {transformedFollowingPosts.map((post) => (
             <PostCard 
               key={`following-${post.id}`} 
               post={post} 
               session={session}
               handleToggleLike={handleToggleLike}
               handleToggleComments={handleToggleComments}
               handleStartEditPost={handleStartEditPost}
               handleCancelEdit={handleCancelEdit}
               handleSaveEdit={handleSaveEdit}
               handleDeletePost={handleDeletePost}
               handleAddComment={handleAddComment}
               editingPostId={editingPostId}
               editContent={editContent}
               setEditContent={setEditContent}
               showCommentsFor={showCommentsFor}
               commentText={commentText}
               setCommentText={setCommentText}
               comments={comments?.filter(c => c.postId === post.id)} // Pass filtered comments
               isCommentsLoading={isCommentsLoading && showCommentsFor === post.id}
               isEditLoading={editPostMutation.isLoading && editingPostId === post.id}
               isDeleteLoading={deletePostMutation.isLoading}
               isCommentLoading={addCommentMutation.isLoading && showCommentsFor === post.id}
             />
          ))}
           {followingFeed.hasNextPage && (
             <div ref={observerTarget} className="text-center p-4">
               {followingFeed.isFetchingNextPage ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : "Load More"}
             </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 