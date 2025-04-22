"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { trpc } from "@/lib/trpc/client"
import ProfileHeader from "@/components/profile/profile-header"
import { useToast } from "@/components/ui/use-toast"
import { PostCard } from "@/components/new-ui/HomePage"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, User } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { type inferRouterOutputs } from "@trpc/server"
import { type AppRouter } from "@/lib/trpc/root"

// --- Types --- 
type RouterOutput = inferRouterOutputs<AppRouter>
// Type for User prop passed from Server Component
type UserProp = RouterOutput["user"]["getPublicProfile"]
// Post type from infinite query
type UserPost = RouterOutput["post"]["getUserPosts"]["items"][number]
// Redefine PostForCard based on UserPost or the actual structure PostCard needs
type PostForCard = UserPost

// SessionUser assertion type
interface SessionUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  username?: string
}

// --- Skeleton --- 
const PostsLoadingSkeleton = () => (
    <div className="space-y-4 mt-6">
        {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4">
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex gap-6 pt-2">
                            <Skeleton className="h-5 w-10" />
                            <Skeleton className="h-5 w-10" />
                            <Skeleton className="h-5 w-10" />
                        </div>
                    </div>
                </div>
            </Card>
        ))}
    </div>
)

// --- Follow List Dialog --- 
interface FollowListDialogProps {
    userId: string
    username: string
    type: 'followers' | 'following'
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

function FollowListDialog({ userId, username, type, isOpen, onOpenChange }: FollowListDialogProps) {
    // TODO: Fetch followers/following list using tRPC
    // const { data, isLoading } = trpc.user[type === 'followers' ? 'getFollowers' : 'getFollowing'].useQuery({ userId })
    const isLoading = false // Placeholder
    const data: any[] = [] // Placeholder

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-background/80 backdrop-blur-sm border">
                <DialogHeader>
                    <DialogTitle>{type === 'followers' ? 'Followers' : 'Following'} of @{username}</DialogTitle>
                </DialogHeader>
                <div className="py-4 max-h-[400px] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-20">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : data.length === 0 ? (
                        <p className="text-center text-muted-foreground">No users found.</p>
                    ) : (
                        <div className="space-y-3">
                            {/* Placeholder list item - Replace with actual user rendering */}
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded">
                                    <Skeleton className="h-9 w-9 rounded-full" />
                                    <div className="flex-1">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-16 mt-1" />
                                    </div>
                                    <Skeleton className="h-8 w-20 rounded-md" />
                                </div>
                            ))}
                             <p className="text-center text-muted-foreground">Actual user list coming soon...</p> 
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

// --- Client Profile Page Component --- 
interface ClientProfilePageProps {
  user: UserProp
  isCurrentUser: boolean
  initialIsFollowing: boolean
}

export default function ClientProfilePage({ user, isCurrentUser, initialIsFollowing }: ClientProfilePageProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const { data: session } = useSession()
  const { toast } = useToast()
  const utils = trpc.useContext()
  const router = useRouter()

  // State for Post Interactions
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [showCommentsFor, setShowCommentsFor] = useState<string | null>(null)
  const [commentText, setCommentText] = useState("")

  // State for Follow Dialog
  const [followDialogState, setFollowDialogState] = useState<{ open: boolean; type: 'followers' | 'following' | null; userId: string | null }>({ open: false, type: null, userId: null })

  // Follow Mutation (remains largely the same, check invalidate path)
  const { mutate: toggleFollow, isLoading: isFollowLoading } = trpc.user.toggleFollow.useMutation({
    onSuccess: ({ following }) => {
      setIsFollowing(following)
      // Ensure the correct profile query is invalidated
      utils.user.getPublicProfile.invalidate({ username: user.username })
      utils.user.getSuggestedUsers.invalidate()
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

  // Infinite Query for Posts
  const { ref: loadMoreRef, inView: loadMoreInView } = useInView()
  const userPostsQuery = trpc.post.getUserPosts.useInfiniteQuery(
    { userId: user.id, limit: 10 }, // Use userId from prop
    { 
      enabled: !!user.id,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
    }
  )

  useEffect(() => {
    if (loadMoreInView && userPostsQuery.hasNextPage && !userPostsQuery.isFetchingNextPage) {
      userPostsQuery.fetchNextPage()
    }
  }, [loadMoreInView, userPostsQuery])

  const posts = userPostsQuery.data?.pages.flatMap(page => page.items) ?? []
  const isLoadingPostsInitial = userPostsQuery.isLoading && !userPostsQuery.data

  // --- Post Interaction Mutations (Similar to HomePage) --- 
  const toggleLikeMutation = trpc.post.toggleLike.useMutation({ 
    onSuccess: () => { utils.post.getUserPosts.invalidate({ userId: user.id }); }, 
    onError: () => { toast({ title: "Error", description: "Failed to like post.", variant: "destructive" }); }
  })
  const deletePostMutation = trpc.post.deletePost.useMutation({ 
    onSuccess: () => { 
        utils.post.getUserPosts.invalidate({ userId: user.id }); 
        toast({ title: "Success", description: "Post deleted" }); 
    }, 
    onError: (error) => { toast({ title: "Error", description: error.message || "Failed to delete post.", variant: "destructive" }); }
  })
  const editPostMutation = trpc.post.editPost.useMutation({ 
    onSuccess: () => { 
        setEditingPostId(null); 
        utils.post.getUserPosts.invalidate({ userId: user.id }); 
        toast({ title: "Success", description: "Post updated" }); 
    }, 
    onError: (error) => { toast({ title: "Error", description: error.message || "Failed to update post.", variant: "destructive" }); }
  })
  const addCommentMutation = trpc.post.addComment.useMutation({ 
    onSuccess: (data, variables) => { 
        setCommentText(""); 
        utils.post.getUserPosts.invalidate({ userId: user.id }); 
        utils.post.getComments.invalidate({ postId: variables.postId }); 
    }, 
    onError: () => { toast({ title: "Error", description: "Failed to add comment.", variant: "destructive" }); }
  })

  // Comments query (potentially move inside PostCard)
  const { data: comments, isLoading: isCommentsLoading } = trpc.post.getComments.useQuery(
    { postId: showCommentsFor || "" }, 
    { enabled: !!showCommentsFor }
  )

  // --- Handlers --- 
  const handleToggleFollow = () => {
    if (!isCurrentUser) {
      toggleFollow({ userId: user.id });
    }
  };

  const openFollowDialog = (type: 'followers' | 'following') => {
      setFollowDialogState({ open: true, type, userId: user.id });
  };

  // Post Interaction Handlers (Pass down to PostCard) - Corrected Syntax
  const handleToggleLike = (postId: string): void => { 
      if (!session) { 
          toast({ title: "Login required", description: "Please log in to like posts.", variant: "destructive" }); 
          return; 
      } 
      toggleLikeMutation.mutate({ postId }); 
  };

  const handleToggleComments = (postId: string): void => { 
      setShowCommentsFor(prev => prev === postId ? null : postId); 
      setCommentText(""); 
  };

  const handleDeletePost = (postId: string): void => { 
      if (!session) return; 
      // Maybe add a confirmation dialog here in the future?
      deletePostMutation.mutate({ postId }); 
  };

  const handleStartEditPost = (post: PostForCard): void => { // Assuming PostForCard is defined correctly
      setEditingPostId(post.id); 
      setEditContent(post.content ?? ""); 
  };

  const handleCancelEdit = (): void => { 
      setEditingPostId(null); 
      setEditContent(""); 
  };

  const handleSaveEdit = (postId: string): void => { 
      if (!session || !editContent.trim()) return; 
      editPostMutation.mutate({ postId, content: editContent }); 
  };
  
  const handleAddComment = (e: React.FormEvent, postId: string): void => { 
      e.preventDefault(); 
      if (!session) { 
          toast({ title: "Login required", description: "Please log in to comment.", variant: "destructive" }); 
          return; 
      } 
      if (!commentText.trim()) return; 
      addCommentMutation.mutate({ postId, content: commentText }); 
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      <ProfileHeader
        user={user}
        isCurrentUser={isCurrentUser}
        isFollowing={isFollowing}
        isFollowLoading={isFollowLoading}
        handleToggleFollow={handleToggleFollow}
        // Pass handler to open dialog
        onShowFollowList={openFollowDialog} 
      />
      {/* Main Content Area */} 
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4">
          {/* Tabs (Optional - can add later if needed for Replies/Media/Likes) */} 
          {/* <Tabs defaultValue="posts" className="mb-6"> ... </Tabs> */} 
          
          {/* Posts Feed */} 
          <div className="mt-4">
              {isLoadingPostsInitial ? (
                <PostsLoadingSkeleton />
              ) : posts.length === 0 ? (
                <Card className="p-8 text-center border-dashed">
                  <p className="text-muted-foreground">@{user.username} hasn't posted yet.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostCard 
                      key={post.id} 
                      // Pass post data using the corrected type (remove 'as any')
                      post={post} 
                      session={session} 
                      // Pass down all handlers
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
                      comments={comments?.filter(c => c.postId === post.id)} 
                      isCommentsLoading={isCommentsLoading && showCommentsFor === post.id}
                      isEditLoading={editPostMutation.isLoading && editingPostId === post.id}
                      isDeleteLoading={deletePostMutation.isLoading}
                      isCommentLoading={addCommentMutation.isLoading && showCommentsFor === post.id}
                    />
                  ))}
                  
                  {/* Infinite scroll trigger */} 
                  <div ref={loadMoreRef} className="h-10 flex justify-center items-center">
                    {userPostsQuery.isFetchingNextPage ? (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : !userPostsQuery.hasNextPage && posts.length > 0 ? (
                      <p className="text-sm text-muted-foreground">No more posts</p>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>

       {/* Render Follow List Dialog */} 
       <FollowListDialog 
         isOpen={followDialogState.open}
         onOpenChange={(open) => setFollowDialogState(prev => ({ ...prev, open }))}
         type={followDialogState.type ?? 'followers'} 
         userId={followDialogState.userId ?? ''} 
         username={user.username} 
       />
    </div>
  )
} 