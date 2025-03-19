'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

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

export default function ExploreSection() {
  const [devToArticles, setDevToArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDevToArticles = async () => {
      try {
        const response = await fetch('https://dev.to/api/articles?per_page=10');
        const data = await response.json();
        setDevToArticles(data);
      } catch (error) {
        console.error('Error fetching DEV.to articles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDevToArticles();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="articles">Latest Articles</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>
        <TabsContent value="articles">
          <ScrollArea className="h-[600px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <p>Loading articles...</p>
              </div>
            ) : (
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
            )}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="trending">
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>
                Trending developer news and discussions will be available here soon.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 