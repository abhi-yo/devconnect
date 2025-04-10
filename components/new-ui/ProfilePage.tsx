"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, MapPin, Link as LinkIcon, Calendar, Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UserProfile {
  id: string;
  name: string;
  username: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedDate: string;
  image?: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

interface Post {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    username: string;
    image?: string;
  };
  likes?: Array<any>;
  comments?: Array<any>;
  shares?: Array<any>;
}

export function ProfilePage() {
  const params = useParams();
  const username = typeof params?.username === 'string' ? params.username : '';
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;
      
      try {
        setIsLoadingProfile(true);
        const response = await fetch(`/api/users/${username}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          setIsFollowing(data.isFollowing);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [username]);

  // Fetch user posts
  useEffect(() => {
    const fetchPosts = async () => {
      if (!username) return;
      
      try {
        setIsLoadingPosts(true);
        const response = await fetch(`/api/users/${username}/posts`);
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [username]);

  const handleFollowToggle = async () => {
    if (!profile) return;
    
    try {
      setIsUpdatingFollow(true);
      const response = await fetch(`/api/users/${username}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
      });
      
      if (response.ok) {
        setIsFollowing(!isFollowing);
        setProfile(prev => {
          if (!prev) return null;
          return {
            ...prev,
            followersCount: isFollowing 
              ? prev.followersCount - 1 
              : prev.followersCount + 1,
            isFollowing: !isFollowing
          };
        });
      }
    } catch (error) {
      console.error("Failed to update follow status:", error);
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Loading profile...</p>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">User not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Profile Header */}
      <Card className="mb-6">
        <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500"></div>
        
        <div className="px-6 pb-6">
          <div className="flex justify-between relative">
            <Avatar className="h-24 w-24 border-4 border-background -mt-12">
              <AvatarImage 
                src={profile.image || undefined} 
                alt={profile.name} 
              />
              <AvatarFallback>
                <User className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            
            <div className="mt-4">
              <Button 
                variant={isFollowing ? "outline" : "default"}
                onClick={handleFollowToggle}
                disabled={isUpdatingFollow}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            </div>
          </div>
          
          <div className="mt-4">
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <p className="text-muted-foreground">@{profile.username}</p>
            
            {profile.bio && (
              <p className="mt-4">{profile.bio}</p>
            )}
            
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              
              {profile.website && (
                <div className="flex items-center gap-1">
                  <LinkIcon className="h-4 w-4" />
                  <a 
                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Joined {new Date(profile.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
            
            <div className="flex gap-4 mt-4">
              <div>
                <span className="font-bold">{profile.followingCount}</span>{' '}
                <span className="text-muted-foreground">Following</span>
              </div>
              <div>
                <span className="font-bold">{profile.followersCount}</span>{' '}
                <span className="text-muted-foreground">Followers</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Tabs */}
      <Tabs defaultValue="posts" className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="replies">Replies</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="likes">Likes</TabsTrigger>
        </TabsList>
        
        {/* Posts Tab */}
        <TabsContent value="posts" className="mt-6">
          {isLoadingPosts ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Loading posts...</p>
            </Card>
          ) : posts.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No posts yet</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={post.author?.image || undefined} 
                        alt={post.author?.name || "User"} 
                      />
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{post.author?.name || "User"}</span>
                          <span className="text-muted-foreground">@{post.author?.username || "user"}</span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="mt-2">{post.content}</div>
                      
                      <div className="flex items-center gap-6 mt-4">
                        <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5">
                          <Heart className="h-4 w-4" />
                          <span>{post.likes?.length || 0}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comments?.length || 0}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5">
                          <Share2 className="h-4 w-4" />
                          <span>{post.shares?.length || 0}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Empty States for Other Tabs */}
        <TabsContent value="replies" className="mt-6">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No replies yet</p>
          </Card>
        </TabsContent>
        
        <TabsContent value="media" className="mt-6">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No media posts yet</p>
          </Card>
        </TabsContent>
        
        <TabsContent value="likes" className="mt-6">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No liked posts yet</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 