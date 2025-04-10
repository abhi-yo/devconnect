"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, User, Hash, TrendingUp, Globe, Github, Library, Code, BookOpen, ExternalLink, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

// Define types
interface Topic {
  id: string;
  name: string;
  postCount: number;
}

interface Developer {
  id: string;
  name: string;
  username: string;
  image?: string;
  bio?: string;
  isFollowing?: boolean;
}

interface TrendingItem {
  id: string;
  title: string;
  source: string;
  url?: string;
  publishedAt: string;
  description?: string;
  popularity: number; // For unified sorting
  timestamp: number; // For unified sorting
}

interface PaginationMetadata {
  page: number;
  per_page: number;
  total?: number;
  has_more: boolean;
  after?: string;
  subreddit?: string;
}

// Define resource icons mapping
const resourceIcons = {
  BookOpen: BookOpen,
  Code: Code,
  Library: Library,
  Globe: Globe,
  Github: Github
};

// Define resource icon type
type ResourceIconType = keyof typeof resourceIcons;

interface DevResource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  icon: ResourceIconType;
}

export function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [trendingSource, setTrendingSource] = useState<string>("github");
  const [trendingSort, setTrendingSort] = useState<'popularity' | 'recent'>('popularity');
  
  // Pagination states
  const [trendingPage, setTrendingPage] = useState(1);
  const [topicsPage, setTopicsPage] = useState(1);
  const [developersPage, setDevelopersPage] = useState(1);
  
  // Store pagination metadata for each source
  const [githubPagination, setGithubPagination] = useState<PaginationMetadata | null>(null);
  const [devtoPagination, setDevtoPagination] = useState<PaginationMetadata | null>(null);
  
  // Loading states
  const [isLoadingMoreTrending, setIsLoadingMoreTrending] = useState(false);
  
  // Observer ref for infinite scrolling
  const observerRef = useRef<IntersectionObserver | null>(null);
  const trendingEndRef = useRef<HTMLDivElement>(null);
  
  // tRPC queries
  const topicsQuery = trpc.topic.getTrending.useQuery();
  const developersQuery = trpc.user.getSuggestedUsers.useQuery();
  const utils = trpc.useContext();
  
  // Follow mutation
  const { mutate: toggleFollow, isLoading: followLoading } = trpc.user.toggleFollow.useMutation({
    onSuccess: ({ following }, { userId }) => {
      utils.user.getSuggestedUsers.setData(undefined, (old) => {
        if (!old) return old;
        return old.map(user => 
          user.id === userId ? { ...user, isFollowing: following } : user
        );
      });
    },
    onError: (error) => {
      console.error("Failed to update follow status:", error);
    }
  });
  
  // State for different trending sources
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [hasMoreTrending, setHasMoreTrending] = useState(true);
  
  // Track which developers are being followed
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  
  // Resources for developers
  const [resources, setResources] = useState<DevResource[]>([
    {
      id: "1",
      title: "MDN Web Docs",
      description: "The Mozilla Developer Network (MDN) provides information about Open Web technologies",
      url: "https://developer.mozilla.org",
      category: "Documentation",
      icon: "BookOpen"
    },
    {
      id: "2",
      title: "GitHub Copilot",
      description: "AI pair programmer that helps you write better code",
      url: "https://github.com/features/copilot",
      category: "Tools",
      icon: "Code"
    },
    {
      id: "3",
      title: "freeCodeCamp",
      description: "Learn to code for free with interactive tutorials",
      url: "https://www.freecodecamp.org/",
      category: "Learning",
      icon: "Library"
    },
    {
      id: "4",
      title: "Roadmap.sh",
      description: "Community efforts to create roadmaps, guides for developers",
      url: "https://roadmap.sh/",
      category: "Career",
      icon: "Globe"
    },
    {
      id: "5",
      title: "CSS-Tricks",
      description: "Daily articles about CSS, HTML, JavaScript, and all things web design and development",
      url: "https://css-tricks.com/",
      category: "Frontend",
      icon: "Code"
    },
    {
      id: "6",
      title: "Can I Use",
      description: "Browser support tables for modern web technologies",
      url: "https://caniuse.com/",
      category: "Tools",
      icon: "Globe"
    }
  ]);

  // Virtual scrolling window size - how many items to display at once
  const [virtualWindowSize, setVirtualWindowSize] = useState(50);
  
  // Total items loaded and total items count for display
  const [totalItemsLoaded, setTotalItemsLoaded] = useState(0);
  const [totalItemsCount, setTotalItemsCount] = useState(0);

  // Filter trending items based on selected source
  const filteredTrendingItems = trendingItems.filter(item => 
    item.source.toLowerCase().includes(trendingSource.toLowerCase())
  );
  
  // Determine if we have more items to load based on the source
  const hasMoreItems = useCallback(() => {
    if (trendingSource.toLowerCase().includes("github")) {
      return githubPagination?.has_more || false;
    }
    
    if (trendingSource.toLowerCase().includes("dev.to")) {
      return devtoPagination?.has_more || false;
    }
    
    return false;
  }, [trendingSource, githubPagination, devtoPagination]);
  
  // Get items to display with virtual scrolling
  const displayItems = filteredTrendingItems.slice(0, virtualWindowSize);
  
  // Fetch trending content (GitHub, Dev.to)
  const fetchTrendingContent = useCallback(async (page = 1, refresh = false) => {
    try {
      setIsLoadingMoreTrending(page > 1);
      if (page === 1) setIsLoadingTrending(true);
      
      // Only fetch current selected source to reduce API calls
      const shouldFetchGithub = trendingSource.toLowerCase().includes("github");
      const shouldFetchDevto = trendingSource.toLowerCase().includes("dev.to");
      
      // Start with an empty array for all items
      let allItems: TrendingItem[] = [];
      
      // Fetch GitHub if selected
      if (shouldFetchGithub) {
        try {
          const params = new URLSearchParams({
            page: page.toString(),
            per_page: "30" // Reduced to avoid overloading
          });
          
          const githubResponse = await fetch(`/api/github-trending?${params.toString()}`);
          const data = await githubResponse.json();
          
          if (data.repositories) {
            const githubItems = (data.repositories || []).map((repo: any) => ({
              id: `github-${repo.id}`,
              title: repo.full_name || repo.name,
              source: "GitHub",
              url: repo.html_url || repo.url,
              publishedAt: repo.created_at || new Date().toISOString(),
              description: repo.description || "",
              popularity: repo.stargazers_count || 0,
              timestamp: new Date(repo.created_at || Date.now()).getTime()
            }));
            
            allItems = [...allItems, ...githubItems];
            
            if (data.pagination) {
              setGithubPagination(data.pagination);
            }
            
            console.log("Fetched GitHub items:", githubItems.length);
          }
        } catch (error) {
          console.error("Error fetching GitHub:", error);
        }
      }
      
      // Fetch Dev.to if selected
      if (shouldFetchDevto) {
        try {
          const params = new URLSearchParams({
            page: page.toString(),
            per_page: "30" // Reduced to avoid overloading
          });
          
          // Add retry logic for Dev.to API which sometimes fails
          let retries = 2;
          let devtoItems: TrendingItem[] = [];
          
          while (retries >= 0 && devtoItems.length === 0) {
            try {
              const devtoResponse = await fetch(`/api/devto?${params.toString()}`);
              if (devtoResponse.ok) {
                const data = await devtoResponse.json();
                devtoItems = (data.articles || []).map((article: any) => ({
                  id: `devto-${article.id}`,
                  title: article.title,
                  source: "Dev.to",
                  url: article.url,
                  publishedAt: article.published_at || new Date().toISOString(),
                  description: article.description || "",
                  popularity: (article.public_reactions_count || 0) + (article.comments_count || 0),
                  timestamp: new Date(article.published_at || Date.now()).getTime()
                }));
                
                if (data.pagination) {
                  setDevtoPagination(data.pagination);
                }
              } else {
                // Wait a bit before retrying
                await new Promise(r => setTimeout(r, 300));
              }
            } catch (error) {
              console.error(`Dev.to fetch attempt failed (${retries} retries left):`, error);
              // Wait a bit before retrying
              await new Promise(r => setTimeout(r, 300));
            }
            
            retries--;
          }
          
          if (devtoItems.length > 0) {
            console.log("Fetched Dev.to items:", devtoItems.length);
            allItems = [...allItems, ...devtoItems];
          } else {
            console.warn("Could not fetch Dev.to items after multiple attempts");
          }
        } catch (error) {
          console.error("Error fetching Dev.to:", error);
        }
      }
      
      // Sort items based on selected criteria
      allItems = allItems.sort((a, b) => {
        if (trendingSort === 'popularity') {
          return b.popularity - a.popularity;
        } else {
          return b.timestamp - a.timestamp;
        }
      });
      
      // Log what we found
      console.log("Items fetched:", {
        total: allItems.length,
        github: allItems.filter(i => i.source === "GitHub").length,
        devto: allItems.filter(i => i.source === "Dev.to").length
      });
      
      // Check if we have more items to load
      setHasMoreTrending(allItems.length > 0);
      
      // Update trending items state
      if (refresh || page === 1) {
        setTrendingItems(allItems);
        // Reset virtual window size for fresh data
        setVirtualWindowSize(Math.min(50, allItems.length));
      } else {
        setTrendingItems(prev => {
          // Combine, deduplicate by ID, and sort
          const combined = [...prev, ...allItems];
          const uniqueIds = new Set();
          const unique = combined.filter(item => {
            if (uniqueIds.has(item.id)) return false;
            uniqueIds.add(item.id);
            return true;
          });
          
          // Apply sorting
          return unique.sort((a, b) => {
            if (trendingSort === 'popularity') {
              return b.popularity - a.popularity;
            } else {
              return b.timestamp - a.timestamp;
            }
          });
        });
        
        // Increase virtual window size to show more items
        setVirtualWindowSize(prev => Math.min(prev + 20, prev + allItems.length));
      }
    } catch (error) {
      console.error("Failed to fetch trending items:", error);
    } finally {
      setIsLoadingTrending(false);
      setIsLoadingMoreTrending(false);
    }
  }, [trendingSource, trendingSort]);
  
  // Effect to re-sort items when sort option changes
  useEffect(() => {
    if (trendingItems.length > 0) {
      setTrendingItems(prev => {
        return [...prev].sort((a, b) => {
          if (trendingSort === 'popularity') {
            return b.popularity - a.popularity;
          } else {
            return b.timestamp - a.timestamp;
          }
        });
      });
    }
  }, [trendingSort]);
  
  // Setup infinite scrolling observer
  useEffect(() => {
    if (trendingEndRef.current) {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting && hasMoreItems() && !isLoadingMoreTrending && !isLoadingTrending) {
            loadMoreTrending();
          }
        },
        { threshold: 0.1, rootMargin: "200px" }
      );
      
      observerRef.current.observe(trendingEndRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMoreItems, isLoadingMoreTrending, isLoadingTrending, trendingItems.length]);
  
  // Initial fetch
  useEffect(() => {
    fetchTrendingContent(1, true);
  }, [fetchTrendingContent]);
  
  // Load more trending items
  const loadMoreTrending = () => {
    if (isLoadingMoreTrending || !hasMoreItems()) return;
    const nextPage = trendingPage + 1;
    setTrendingPage(nextPage);
    fetchTrendingContent(nextPage);
  };
  
  // Load more virtual items without fetching
  const loadMoreVirtualItems = useCallback(() => {
    if (virtualWindowSize < filteredTrendingItems.length) {
      setVirtualWindowSize(prev => Math.min(prev + 50, filteredTrendingItems.length));
    } else if (hasMoreItems() && !isLoadingMoreTrending) {
      loadMoreTrending();
    }
  }, [filteredTrendingItems.length, virtualWindowSize, hasMoreItems, isLoadingMoreTrending]);
  
  // Check if user scrolled near the bottom to load more virtual items
  useEffect(() => {
    const handleScroll = () => {
      // If we're near the bottom, load more virtual items
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1500) {
        loadMoreVirtualItems();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreVirtualItems]);
  
  // Load more topics
  const loadMoreTopics = () => {
    setTopicsPage(prev => prev + 1);
  };
  
  // Load more developers
  const loadMoreDevelopers = () => {
    setDevelopersPage(prev => prev + 1);
  };
  
  // Handle trending source change
  const handleTrendingSourceChange = (value: string) => {
    setTrendingSource(value);
    // Reset pagination and virtual window when source changes
    setTrendingPage(1);
    setVirtualWindowSize(50);
    fetchTrendingContent(1, true);
  };

  // Handle trending sort change
  const handleTrendingSortChange = (value: 'popularity' | 'recent') => {
    setTrendingSort(value);
  };

  // Handle follow/unfollow
  const handleFollowToggle = (userId: string) => {
    toggleFollow({ userId });
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Search Form */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search developers, topics, posts..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Explore Tabs */}
      <Tabs defaultValue="trending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="developers">Developers</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* Trending Tab */}
        <TabsContent value="trending">
          <div className="mb-4 flex justify-between">
            <Select value={trendingSource} onValueChange={handleTrendingSourceChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="github">GitHub</SelectItem>
                <SelectItem value="dev.to">Dev.to</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={trendingSort} onValueChange={handleTrendingSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Most Popular</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Show loading state for initial fetching */}
          {isLoadingTrending && trendingPage === 1 ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="w-full">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-full mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredTrendingItems.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No trending content available</p>
            </Card>
          ) : (
            <>              
              <div className="space-y-3">
                {displayItems.map((item) => {
                  const sourceIcon = item.source === "GitHub" ? 
                    <Github className="h-4 w-4 text-primary" /> : item.source === "Dev.to" ? 
                    <Code className="h-4 w-4 text-primary" /> : 
                    <TrendingUp className="h-4 w-4 text-primary" />;
                  
                  return (
                    <Card key={item.id} className="p-3 hover:bg-muted/50 transition-colors">
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
                        <div className="flex items-start gap-2">
                          <div className="bg-primary/10 rounded-full p-1.5 mt-0.5 flex-shrink-0">
                            {sourceIcon}
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">{item.title}</h3>
                            {item.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                                {item.source}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(item.publishedAt).toLocaleDateString()}
                              </span>
                              {item.popularity > 0 && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  {item.popularity.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </a>
                    </Card>
                  );
                })}
                
                {/* Load more button */}
                {filteredTrendingItems.length > virtualWindowSize && (
                  <div className="flex justify-center py-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setVirtualWindowSize(prev => Math.min(prev + 50, filteredTrendingItems.length))}
                    >
                      Show more
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Load more / Observer target */}
              <div 
                ref={trendingEndRef} 
                className="py-8 flex items-center justify-center"
              >
                {isLoadingMoreTrending && (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                )}
              </div>
            </>
          )}
        </TabsContent>

        {/* Topics Tab */}
        <TabsContent value="topics">
          {topicsQuery.isLoading && topicsPage === 1 ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-1/3 mb-2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                </Card>
              ))}
            </div>
          ) : topicsQuery.data?.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No topics available</p>
            </Card>
          ) : (
            <>
              <div className="space-y-3">
                {topicsQuery.data?.map((topic) => (
                  <Card key={topic.id} className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 rounded-full p-2">
                        <Hash className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium">{topic.name}</h3>
                        <p className="text-xs text-muted-foreground">{topic.postCount} posts</p>
                      </div>
                      <Button variant="outline" size="sm">Follow</Button>
                    </div>
                  </Card>
                ))}
              </div>
              
              {/* Load more topics button */}
              {topicsQuery.data && topicsQuery.data.length >= 5 && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadMoreTopics}
                    disabled={topicsQuery.isFetching}
                    className="gap-2"
                  >
                    {topicsQuery.isFetching && <Loader2 className="h-3 w-3 animate-spin" />}
                    Load more topics
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Developers Tab */}
        <TabsContent value="developers">
          {developersQuery.isLoading && developersPage === 1 ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-1/3 mb-2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                </Card>
              ))}
            </div>
          ) : developersQuery.data?.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No developers to display</p>
            </Card>
          ) : (
            <>
              <div className="space-y-3">
                {developersQuery.data?.map((dev) => (
                  <Card key={dev.id} className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={dev.image || undefined} alt={dev.name} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium">{dev.name}</h3>
                        <p className="text-xs text-muted-foreground">@{dev.username}</p>
                      </div>
                      <Button 
                        variant={dev.isFollowing ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFollowToggle(dev.id)}
                        disabled={followLoading}
                        className="min-w-[80px]"
                      >
                        {followLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : dev.isFollowing ? (
                          "Following"
                        ) : (
                          "Follow"
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
              
              {/* Load more developers button */}
              {developersQuery.data && developersQuery.data.length >= 5 && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadMoreDevelopers}
                    disabled={developersQuery.isFetching}
                    className="gap-2"
                  >
                    {developersQuery.isFetching && <Loader2 className="h-3 w-3 animate-spin" />}
                    Load more developers
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        {/* Resources Tab */}
        <TabsContent value="resources">
          <div className="space-y-3">
            {resources.map((resource) => {
              const IconComponent = resourceIcons[resource.icon];
              return (
                <Card key={resource.id} className="p-3 hover:bg-muted/50 transition-colors">
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="block">
                    <div className="flex items-start gap-2">
                      <div className="bg-primary/10 rounded-full p-1.5 mt-0.5">
                        {IconComponent && <IconComponent className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">{resource.title}</h3>
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{resource.description}</p>
                        <Badge variant="secondary" className="mt-1.5 text-xs">{resource.category}</Badge>
                      </div>
                    </div>
                  </a>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 