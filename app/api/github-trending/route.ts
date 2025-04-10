import { NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_ACCESS_TOKEN || process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN;

// Fallback data in case API calls fail
const fallbackData = {
  repositories: [
    {
      id: "1",
      name: "microsoft/TypeScript",
      full_name: "microsoft/TypeScript",
      description: "TypeScript is a superset of JavaScript that compiles to clean JavaScript output.",
      html_url: "https://github.com/microsoft/TypeScript",
      url: "https://github.com/microsoft/TypeScript",
      created_at: new Date().toISOString(),
      stargazers_count: 42000,
      forks_count: 5000,
      language: "TypeScript",
      owner: {
        login: "microsoft",
        avatar_url: "https://avatars.githubusercontent.com/u/6154722?v=4"
      }
    },
    {
      id: "2",
      name: "next.js",
      full_name: "vercel/next.js",
      description: "The React Framework for Production",
      html_url: "https://github.com/vercel/next.js",
      url: "https://github.com/vercel/next.js",
      created_at: new Date().toISOString(),
      stargazers_count: 75000,
      forks_count: 15000,
      language: "JavaScript",
      owner: {
        login: "vercel",
        avatar_url: "https://avatars.githubusercontent.com/u/14985020?v=4"
      }
    },
    {
      id: "3",
      name: "react",
      full_name: "facebook/react",
      description: "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
      html_url: "https://github.com/facebook/react",
      url: "https://github.com/facebook/react",
      created_at: new Date().toISOString(),
      stargazers_count: 185000,
      forks_count: 40000,
      language: "JavaScript",
      owner: {
        login: "facebook",
        avatar_url: "https://avatars.githubusercontent.com/u/69631?v=4"
      }
    },
    {
      id: "4",
      name: "deno",
      full_name: "denoland/deno",
      description: "A secure runtime for JavaScript and TypeScript.",
      html_url: "https://github.com/denoland/deno",
      url: "https://github.com/denoland/deno",
      created_at: new Date().toISOString(),
      stargazers_count: 80000,
      forks_count: 8000,
      language: "Rust",
      owner: {
        login: "denoland",
        avatar_url: "https://avatars.githubusercontent.com/u/42048915?v=4"
      }
    },
    {
      id: "5",
      name: "tailwindcss",
      full_name: "tailwindlabs/tailwindcss",
      description: "A utility-first CSS framework for rapid UI development.",
      html_url: "https://github.com/tailwindlabs/tailwindcss",
      url: "https://github.com/tailwindlabs/tailwindcss",
      created_at: new Date().toISOString(),
      stargazers_count: 60000,
      forks_count: 3000,
      language: "CSS",
      owner: {
        login: "tailwindlabs",
        avatar_url: "https://avatars.githubusercontent.com/u/67109815?v=4"
      }
    },
    {
      id: "6",
      name: "svelte",
      full_name: "sveltejs/svelte",
      description: "Cybernetically enhanced web apps",
      html_url: "https://github.com/sveltejs/svelte",
      url: "https://github.com/sveltejs/svelte",
      created_at: new Date().toISOString(),
      stargazers_count: 65000,
      forks_count: 3200,
      language: "TypeScript",
      owner: {
        login: "sveltejs",
        avatar_url: "https://avatars.githubusercontent.com/u/23617963?v=4"
      }
    },
    {
      id: "7",
      name: "vue",
      full_name: "vuejs/vue",
      description: "An approachable, performant and versatile framework for building web user interfaces.",
      html_url: "https://github.com/vuejs/vue",
      url: "https://github.com/vuejs/vue",
      created_at: new Date().toISOString(),
      stargazers_count: 200000,
      forks_count: 32000,
      language: "TypeScript",
      owner: {
        login: "vuejs",
        avatar_url: "https://avatars.githubusercontent.com/u/6128107?v=4"
      }
    },
    {
      id: "8",
      name: "vscode",
      full_name: "microsoft/vscode",
      description: "Visual Studio Code",
      html_url: "https://github.com/microsoft/vscode",
      url: "https://github.com/microsoft/vscode",
      created_at: new Date().toISOString(),
      stargazers_count: 140000,
      forks_count: 24000,
      language: "TypeScript",
      owner: {
        login: "microsoft",
        avatar_url: "https://avatars.githubusercontent.com/u/6154722?v=4"
      }
    }
  ]
};

interface GitHubRepository {
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

// Cache for GitHub responses to reduce API calls
let githubCache: {
  repositories: GitHubRepository[];
  timestamp: number;
  pagination: {
    total: number;
    page: number;
    per_page: number;
  };
} | null = null;

// Cache expiration time - 10 minutes
const CACHE_EXPIRATION = 10 * 60 * 1000;

async function fetchTrendingRepositories(page = 1, perPage = 100) {
  // Check if we have a valid cache for single page requests
  if (githubCache && page > 1 && Date.now() - githubCache.timestamp < CACHE_EXPIRATION) {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const cachedRepos = githubCache.repositories.slice(startIndex, endIndex);
    
    if (cachedRepos.length > 0) {
      console.log(`Using cached GitHub repositories for page ${page}`);
      return {
        repositories: cachedRepos,
        pagination: {
          total: githubCache.pagination.total,
          page,
          per_page: perPage,
          has_more: endIndex < githubCache.repositories.length
        }
      };
    }
  }

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const dateQuery = oneMonthAgo.toISOString().split('T')[0];

  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };

  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }

  try {
    const response = await fetch(
      `https://api.github.com/search/repositories?q=created:>${dateQuery}&sort=stars&order=desc&per_page=${perPage}&page=${page}`,
      {
        headers: headers,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.warn(`GitHub API Error: ${errorData.message}`);
      
      // Instead of throwing, return fallback data
      return {
        repositories: fallbackData.repositories.slice(0, perPage) as unknown as GitHubRepository[],
        pagination: {
          total: fallbackData.repositories.length,
          page,
          per_page: perPage,
          has_more: page * perPage < fallbackData.repositories.length
        }
      };
    }

    const data = await response.json();
    return {
      repositories: data.items as GitHubRepository[],
      pagination: {
        total: data.total_count,
        page,
        per_page: perPage,
        has_more: page * perPage < data.total_count
      }
    };
  } catch (error) {
    console.error("Error fetching from GitHub API:", error);
    // Return fallback data on any error
    return {
      repositories: fallbackData.repositories.slice(0, perPage) as unknown as GitHubRepository[],
      pagination: {
        total: fallbackData.repositories.length,
        page,
        per_page: perPage,
        has_more: page * perPage < fallbackData.repositories.length
      }
    };
  }
}

async function fetchMultiplePagesOfRepositories(pages = 2, perPage = 100) {
  // Check if we have a valid cache
  if (githubCache && Date.now() - githubCache.timestamp < CACHE_EXPIRATION) {
    console.log("Using cached GitHub repositories for multiple pages");
    return {
      repositories: githubCache.repositories.slice(0, pages * perPage),
      pagination: {
        total: githubCache.pagination.total,
        page: 1,
        per_page: pages * perPage,
        has_more: pages * perPage < githubCache.repositories.length
      }
    };
  }
  
  try {
    // Limit pages to maximum 2 to reduce API rate limit issues
    const actualPages = Math.min(pages, 2);
    console.log(`Fetching ${actualPages} pages of GitHub repositories`);
    
    const promises = Array.from({ length: actualPages }, (_, i) => 
      fetchTrendingRepositories(i + 1, perPage)
    );
    
    const results = await Promise.allSettled(promises);
    
    // Create a Map to deduplicate repositories by ID
    const uniqueRepos = new Map<number, GitHubRepository>();
    
    // Add repositories to the Map, keeping only the first occurrence
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        result.value.repositories.forEach(repo => {
          if (!uniqueRepos.has(repo.id)) {
            uniqueRepos.set(repo.id, repo);
          }
        });
      }
    });

    // Convert Map back to array
    const allRepositories = Array.from(uniqueRepos.values());
    
    // Use first successful result for total count, or fallback
    const successfulResult = results.find(r => r.status === 'fulfilled');
    const totalCount = successfulResult && 'value' in successfulResult 
      ? successfulResult.value.pagination.total 
      : fallbackData.repositories.length;

    // Update cache
    githubCache = {
      repositories: allRepositories,
      timestamp: Date.now(),
      pagination: {
        total: totalCount,
        page: 1,
        per_page: perPage * actualPages
      }
    };
    
    return {
      repositories: allRepositories,
      pagination: {
        total: totalCount,
        page: 1,
        per_page: allRepositories.length,
        has_more: allRepositories.length < totalCount
      }
    };
  } catch (error) {
    console.error("Error fetching multiple pages:", error);
    return {
      repositories: fallbackData.repositories as unknown as GitHubRepository[],
      pagination: {
        total: fallbackData.repositories.length,
        page: 1,
        per_page: fallbackData.repositories.length,
        has_more: false
      }
    };
  }
}

export async function GET(request: Request) {
  // Always return fallback data if no GitHub token is available
  if (!GITHUB_TOKEN) {
    console.warn('GitHub API token not found, returning fallback data.');
    return NextResponse.json({
      repositories: fallbackData.repositories,
      pagination: { 
        page: 1, 
        per_page: fallbackData.repositories.length, 
        total: fallbackData.repositories.length,
        has_more: false
      }
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '100');

    let data;
    if (page === 1) {
      // Fetch and deduplicate multiple pages for the initial load (limited to 2 pages)
      data = await fetchMultiplePagesOfRepositories(2, perPage);
    } else {
      // Fetch a single page for subsequent loads
      data = await fetchTrendingRepositories(page, perPage);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GitHub API route:', error);
    // Return fallback data on error
    return NextResponse.json({
      repositories: fallbackData.repositories,
      pagination: { 
        page: 1, 
        per_page: fallbackData.repositories.length, 
        total: fallbackData.repositories.length,
        has_more: false
      }
    });
  }
} 