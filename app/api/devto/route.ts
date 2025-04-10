import { NextResponse } from "next/server";

// Fallback data in case API calls fail
const fallbackData = {
  articles: [
    {
      id: "1",
      title: "Understanding React 19's New Features",
      description: "A deep dive into the new features and improvements in React 19.",
      url: "https://dev.to/react/understanding-react-19",
      published_at: new Date().toISOString(),
      tags: ["react", "javascript", "frontend"]
    },
    {
      id: "2",
      title: "Building accessible UI components with shadcn/ui",
      description: "Learn how to create beautiful and accessible UI components using shadcn/ui.",
      url: "https://dev.to/ui/building-accessible-ui",
      published_at: new Date().toISOString(),
      tags: ["ui", "accessibility", "react"]
    },
    {
      id: "3",
      title: "The Complete Guide to TypeScript 5.4",
      description: "Everything you need to know about the latest TypeScript release.",
      url: "https://dev.to/typescript/complete-guide-typescript-5-4",
      published_at: new Date().toISOString(),
      tags: ["typescript", "javascript"]
    },
    {
      id: "4",
      title: "Next.js API Routes vs Server Actions",
      description: "Comparing Next.js API Routes with Server Actions for backend functionality.",
      url: "https://dev.to/nextjs/api-routes-vs-server-actions",
      published_at: new Date().toISOString(),
      tags: ["nextjs", "react"]
    },
    {
      id: "5",
      title: "Mastering Tailwind CSS: Advanced Patterns",
      description: "Learn advanced techniques and patterns for building UIs with Tailwind CSS.",
      url: "https://dev.to/tailwind/advanced-patterns",
      published_at: new Date().toISOString(),
      tags: ["css", "tailwind", "frontend"]
    }
  ]
};

interface DevToArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  published_at: string;
  user: {
    name: string;
  };
}

async function fetchDevToArticles(page = 1, perPage = 100, tag = "") {
  const params = new URLSearchParams({
    per_page: perPage.toString(),
    page: page.toString(),
  });

  if (tag) {
    params.append('tag', tag);
  }

  const response = await fetch(`https://dev.to/api/articles?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch DEV.to articles');
  }

  const articles = await response.json() as DevToArticle[];
  const totalCount = parseInt(response.headers.get('total-count') || '0');

  return {
    articles,
    pagination: {
      total: totalCount,
      page,
      per_page: perPage,
    }
  };
}

async function fetchMultipleTagsArticles(perPage = 100) {
  const tags = [
    'programming',
    'javascript',
    'typescript',
    'react',
    'nextjs',
    'node',
    'python',
    'fullstack',
    'aws',
    'devops',
    'tutorial',
    'ai',
    'machinelearning'
  ];

  const promises = tags.map(tag => 
    fetchDevToArticles(1, Math.ceil(perPage / tags.length), tag)
  );
  
  const results = await Promise.all(promises);
  
  // Create a Map to deduplicate articles by ID
  const uniqueArticles = new Map<number, DevToArticle>();
  
  // Add articles to the Map, keeping only the first occurrence of each ID
  results.forEach(result => {
    result.articles.forEach(article => {
      if (!uniqueArticles.has(article.id)) {
        uniqueArticles.set(article.id, article);
      }
    });
  });

  // Convert Map back to array
  const allArticles = Array.from(uniqueArticles.values());
  
  // Calculate total count based on unique articles
  const totalCount = results.reduce((sum, result) => sum + result.pagination.total, 0);

  return {
    articles: allArticles,
    pagination: {
      total: totalCount,
      page: 1,
      per_page: perPage,
    }
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '100');
    const tag = searchParams.get('tag') || '';
    const top = searchParams.get('top');
    const sortBy = searchParams.get('sort_by');

    let data;
    if (page === 1) {
      data = await fetchMultipleTagsArticles(perPage);
    } else {
      data = await fetchDevToArticles(page, perPage, tag);
    }

    if (top) {
      data.articles = data.articles.filter((article: DevToArticle) => {
        const publishedDate = new Date(article.published_at);
        const now = new Date();
        const daysDiff = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= parseInt(top);
      });
    }

    if (sortBy === 'published_at') {
      data.articles.sort((a: DevToArticle, b: DevToArticle) => 
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching DEV.to articles:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch DEV.to articles' },
      { status: 500 }
    );
  }
} 