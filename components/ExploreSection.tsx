'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StarIcon, GitForkIcon, Loader2, ArrowUpIcon, MessageSquare } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Article {
  id: string;
  title: string;
  url: string;
  published_at?: string;
  user?: {
    name: string;
  };
  description?: string;
}

interface Repository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

interface RedditPost {
  id: string;
  title: string;
  url: string;
  subreddit: string;
  score: number;
  numComments: number;
  author: string;
  created: Date;
  thumbnail: string | null;
  selftext: string;
}

export default function ExploreSection() {
  const [devToArticles, setDevToArticles] = useState<Article[]>([]);
  const [devToError, setDevToError] = useState<string | null>(null);
  const [redditPosts, setRedditPosts] = useState<RedditPost[]>([]);
  const [redditAfter, setRedditAfter] = useState<string | null>(null);
  const [hasMoreRedditPosts, setHasMoreRedditPosts] = useState(true);
  const [trendingRepos, setTrendingRepos] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedditLoading, setIsRedditLoading] = useState(true);
  const [isTrendingLoading, setIsTrendingLoading] = useState(true);
  const [trendingError, setTrendingError] = useState<string | null>(null);
  const [articlesPage, setArticlesPage] = useState(1);
  const [reposPage, setReposPage] = useState(1);
  const [hasMoreArticles, setHasMoreArticles] = useState(true);
  const [hasMoreRepos, setHasMoreRepos] = useState(true);
  const [activeTab, setActiveTab] = useState('articles');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [redditSort, setRedditSort] = useState<'top' | 'new'>('top');
  const [devToSort, setDevToSort] = useState<'top' | 'published_at'>('top');
  const [redditError, setRedditError] = useState<string | null>(null);

  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchDevToArticles = async (page: number) => {
    try {
      setIsLoadingMore(true);
      setDevToError(null);

      const params = new URLSearchParams({
        per_page: '30',
        page: page.toString(),
      });

      params.append('tag', 'programming');

      if (devToSort === 'top') {
        params.append('top', '7');
      } else {
        params.append('sort_by', 'published_at');
      }

      const response = await fetch(`https://dev.to/api/articles?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch DEV.to articles');
      }

      const data = await response.json();
      
      if (!Array.isArray(data) || data.length === 0) {
        setHasMoreArticles(false);
        return;
      }

      setDevToArticles(prev => page === 1 ? data : [...prev, ...data]);
    } catch (error) {
      console.error('Error fetching DEV.to articles:', error);
      setDevToError(error instanceof Error ? error.message : 'Failed to fetch DEV.to articles');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const fetchTrendingRepos = async (page: number) => {
    try {
      setIsLoadingMore(true);
      setTrendingError(null);

      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const dateQuery = sixMonthsAgo.toISOString().split('T')[0];

      const response = await fetch(
        `https://api.github.com/search/repositories?q=created:>${dateQuery}&sort=stars&order=desc&per_page=30&page=${page}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub API Error: ${errorData.message}`);
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        setHasMoreRepos(false);
        return;
      }

      setTrendingRepos(prev => page === 1 ? data.items : [...prev, ...data.items]);
    } catch (error) {
      console.error('Error fetching trending repositories:', error);
      setTrendingError(error instanceof Error ? error.message : 'Failed to fetch trending repositories');
    } finally {
      setIsTrendingLoading(false);
      setIsLoadingMore(false);
    }
  };

  const fetchRedditPosts = async (after?: string) => {
    try {
      setIsLoadingMore(true);
      setRedditError(null);
      const url = new URL('/api/reddit', window.location.origin);
      if (after) url.searchParams.set('after', after);
      url.searchParams.set('sort', redditSort);
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Reddit posts');
      }
      
      if (!data.posts || data.posts.length === 0) {
        setHasMoreRedditPosts(false);
        return;
      }

      setRedditPosts(prev => after ? [...prev, ...data.posts] : data.posts);
      setRedditAfter(data.after);
      setHasMoreRedditPosts(!!data.after);
    } catch (error) {
      console.error('Error fetching Reddit posts:', error);
      setRedditError(error instanceof Error ? error.message : 'Failed to fetch Reddit posts');
    } finally {
      setIsRedditLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    setRedditPosts([]);
    setRedditAfter(null);
    setHasMoreRedditPosts(true);
    setIsRedditLoading(true);
    fetchRedditPosts();
  }, [redditSort]);

  useEffect(() => {
    setDevToArticles([]);
    setArticlesPage(1);
    setHasMoreArticles(true);
    setIsLoading(true);
    setDevToError(null);
    fetchDevToArticles(1);
  }, [devToSort]);

  useEffect(() => {
    fetchDevToArticles(1);
    fetchTrendingRepos(1);
  }, []);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && !isLoadingMore) {
        if (activeTab === 'articles' && hasMoreArticles) {
          setArticlesPage(prev => prev + 1);
          fetchDevToArticles(articlesPage + 1);
        } else if (activeTab === 'trending' && hasMoreRepos) {
          setReposPage(prev => prev + 1);
          fetchTrendingRepos(reposPage + 1);
        } else if (activeTab === 'reddit' && hasMoreRedditPosts && redditAfter) {
          fetchRedditPosts(redditAfter);
        }
      }
    },
    [activeTab, hasMoreArticles, hasMoreRepos, hasMoreRedditPosts, isLoadingMore, articlesPage, reposPage, redditAfter]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: '200px',
      threshold: 0.1,
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [handleIntersect]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Tabs defaultValue="articles" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="articles">DEV.to Articles</TabsTrigger>
          <TabsTrigger value="reddit">Reddit</TabsTrigger>
          <TabsTrigger value="trending">GitHub Trending</TabsTrigger>
        </TabsList>
        
        <TabsContent value="articles">
          <div className="mb-4">
            <Select value={devToSort} onValueChange={(value: 'top' | 'published_at') => setDevToSort(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Popular (This Week)</SelectItem>
                <SelectItem value="published_at">Latest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="h-[600px]">
            {isLoading && devToArticles.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <p>Loading articles...</p>
              </div>
            ) : devToError ? (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Error Loading Articles</CardTitle>
                  <CardDescription>{devToError}</CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <>
                <div className="grid gap-4">
                  {devToArticles.map((article) => (
                    <Card key={article.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <a href={article.url} target="_blank" rel="noopener noreferrer">
                        <CardHeader>
                          <CardTitle className="text-lg">{article.title}</CardTitle>
                          <CardDescription>
                            {article.user?.name} • {new Date(article.published_at || '').toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        {article.description && (
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {article.description}
                            </p>
                          </CardContent>
                        )}
                      </a>
                    </Card>
                  ))}
                </div>
                {hasMoreArticles && (
                  <div 
                    ref={observerTarget}
                    className="flex justify-center py-4"
                  >
                    {isLoadingMore && activeTab === 'articles' && (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    )}
                  </div>
                )}
              </>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="reddit">
          <div className="mb-4">
            <Select value={redditSort} onValueChange={(value: 'top' | 'new') => setRedditSort(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Popular (This Week)</SelectItem>
                <SelectItem value="new">Latest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="h-[600px] w-full">
            {isRedditLoading && redditPosts.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <p>Loading Reddit posts...</p>
              </div>
            ) : redditError ? (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Error Loading Reddit Posts</CardTitle>
                  <CardDescription>{redditError}</CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <>
                <div className="grid gap-4 pr-4">
                  {redditPosts.map((post) => (
                    <Card key={post.id} className="cursor-pointer hover:bg-accent/50 transition-colors overflow-hidden">
                      <a href={post.url} target="_blank" rel="noopener noreferrer">
                        <CardHeader className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground/80 hover:text-primary hover:underline">
                              {post.subreddit}
                            </span>
                            <span>•</span>
                            <span className="hover:underline">u/{post.author}</span>
                            <span>•</span>
                            <span>{new Date(post.created).toLocaleDateString()}</span>
                          </div>
                          <CardTitle className="text-lg font-semibold break-words leading-tight">
                            {post.title}
                          </CardTitle>
                          {post.selftext && (
                            <CardContent className="p-0">
                              <p className="text-sm text-muted-foreground/90 line-clamp-2 break-words leading-normal">
                                {post.selftext}
                              </p>
                            </CardContent>
                          )}
                          <div className="flex items-center gap-4 text-muted-foreground/75 pt-1">
                            <div className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors">
                              <ArrowUpIcon className="h-4 w-4" />
                              <span className="font-medium">{post.score.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors">
                              <MessageSquare className="h-4 w-4" />
                              <span className="font-medium">{post.numComments.toLocaleString()}</span>
                              <span className="text-xs">comments</span>
                            </div>
                          </div>
                        </CardHeader>
                      </a>
                    </Card>
                  ))}
                </div>
                {hasMoreRedditPosts && (
                  <div 
                    ref={observerTarget}
                    className="flex justify-center py-4"
                  >
                    {isLoadingMore && activeTab === 'reddit' && (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    )}
                  </div>
                )}
              </>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="trending">
          <ScrollArea className="h-[600px]">
            {isTrendingLoading ? (
              <div className="flex items-center justify-center h-32">
                <p>Loading trending repositories...</p>
              </div>
            ) : trendingError ? (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Error Loading Trending Repositories</CardTitle>
                  <CardDescription>{trendingError}</CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <>
                <div className="grid gap-4">
                  {trendingRepos.map((repo) => (
                    <Card key={repo.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <img 
                              src={repo.owner.avatar_url} 
                              alt={repo.owner.login}
                              className="w-5 h-5 rounded-full"
                            />
                            <CardTitle className="text-base font-medium">{repo.full_name}</CardTitle>
                          </div>
                          <CardDescription className="mt-2">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <StarIcon className="w-3.5 h-3.5" />
                                {repo.stargazers_count.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <GitForkIcon className="w-3.5 h-3.5" />
                                {repo.forks_count.toLocaleString()}
                              </span>
                              {repo.language && (
                                <span className="text-xs">{repo.language}</span>
                              )}
                            </div>
                          </CardDescription>
                        </CardHeader>
                        {repo.description && (
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {repo.description}
                            </p>
                          </CardContent>
                        )}
                      </a>
                    </Card>
                  ))}
                </div>
                {hasMoreRepos && (
                  <div 
                    ref={observerTarget}
                    className="flex justify-center py-4"
                  >
                    {isLoadingMore && (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    )}
                  </div>
                )}
              </>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
} 