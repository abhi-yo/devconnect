import { NextResponse } from 'next/server';

const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;

let redditAccessToken: string | null = null;
let tokenExpiryTime: number | null = null;

// Cache for Reddit responses to reduce API calls
let redditCache: {
  posts: FormattedRedditPost[];
  timestamp: number;
  after: string | null;
} | null = null;

// Cache expiration time - 5 minutes
const CACHE_EXPIRATION = 5 * 60 * 1000;

// Fallback data for when Reddit API is rate limited
const fallbackRedditPosts: FormattedRedditPost[] = [
  {
    id: "abc123",
    title: "Building a Modern Next.js Application with TypeScript",
    url: "https://reddit.com/r/nextjs/comments/xyz",
    subreddit: "nextjs",
    score: 432,
    numComments: 56,
    author: "nextjs_dev",
    created: new Date(),
    selftext: "I've been working on a side project using Next.js 14 with TypeScript and wanted to share my learnings..."
  },
  {
    id: "def456",
    title: "10 TypeScript Tips That Will Make Your Code Better",
    url: "https://reddit.com/r/typescript/comments/abc",
    subreddit: "typescript",
    score: 325,
    numComments: 42,
    author: "ts_enthusiast",
    created: new Date(Date.now() - 24 * 60 * 60 * 1000),
    selftext: "After using TypeScript extensively for 3 years, here are some tips I wish I knew earlier..."
  },
  {
    id: "ghi789",
    title: "React Server Components Changed How I Build Apps",
    url: "https://reddit.com/r/reactjs/comments/def",
    subreddit: "reactjs",
    score: 867,
    numComments: 143,
    author: "react_dev",
    created: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    selftext: "I spent the last month rebuilding our app with React Server Components and the results were impressive..."
  },
  {
    id: "jkl012",
    title: "The Ultimate Guide to Debugging JavaScript",
    url: "https://reddit.com/r/javascript/comments/ghi",
    subreddit: "javascript",
    score: 542,
    numComments: 87,
    author: "js_debugger",
    created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    selftext: "Debugging JavaScript can be frustrating, so I created this comprehensive guide to help developers..."
  },
  {
    id: "mno345",
    title: "How We Reduced Our Node.js API Response Time by 80%",
    url: "https://reddit.com/r/nodejs/comments/jkl",
    subreddit: "nodejs",
    score: 723,
    numComments: 112,
    author: "node_optimizer",
    created: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    selftext: "Our team recently completed a performance optimization project on our Node.js API, here's what we learned..."
  }
];

async function getRedditAccessToken() {
  // If we have a valid token, return it
  if (redditAccessToken && tokenExpiryTime && Date.now() < tokenExpiryTime) {
    return redditAccessToken;
  }

  if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET) {
    console.warn('Reddit Client ID or Secret not configured in .env');
    return null;
  }

  try {
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64')}`,
        'User-Agent': 'DevConnect/1.0.0 by YourUsername' // Replace YourUsername
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Reddit Auth Error Body:", errorBody);
        console.warn(`Reddit Auth API error: ${response.status} ${response.statusText}`);
        return null;
    }

    const data = await response.json();
    if (!data.access_token) {
        console.warn('Failed to retrieve access token from Reddit');
        return null;
    }
    
    redditAccessToken = data.access_token;
    // Set expiry time slightly earlier than actual expiry (e.g., 5 minutes)
    tokenExpiryTime = Date.now() + (data.expires_in - 300) * 1000;
    
    return redditAccessToken;
  } catch (error) {
    console.error('Error getting Reddit access token:', error);
    // Reset token state on failure
    redditAccessToken = null;
    tokenExpiryTime = null;
    return null; // Return null instead of rethrowing
  }
}

interface RedditPostRaw {
  id: string;
  title: string;
  url: string;
  subreddit: string;
  score: number;
  num_comments: number;
  author: string;
  created_utc: number;
  selftext: string;
  permalink: string;
}

interface RedditResponse {
  data: {
    children: Array<{
      data: RedditPostRaw;
    }>;
    after: string | null;
  };
}

interface FormattedRedditPost {
  id: string;
  title: string;
  url: string;
  subreddit: string;
  score: number;
  numComments: number;
  author: string;
  created: Date;
  selftext: string;
}

async function fetchSubredditPosts(subreddit: string, accessToken: string, limit = 100, after: string = '', sort: 'hot' | 'new' = 'hot') {
  const url = new URL(`https://oauth.reddit.com/r/${subreddit}/${sort}`, 'https://oauth.reddit.com');
  url.searchParams.set('limit', limit.toString());
  if (after) url.searchParams.set('after', after);
  // Add t=week for top sorting if needed, though GET handler currently uses hot/new
  // if (sort === 'top') url.searchParams.set('t', 'week');

  try {
          const response = await fetch(url, {
            headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'DevConnect/1.0.0 by YourUsername', // Replace YourUsername
            },
          });

          if (!response.ok) {
      console.warn(`Reddit API error fetching posts from r/${subreddit}: ${response.status} ${response.statusText}`);
            return { posts: [], after: null };
          }

    const data = await response.json() as RedditResponse;
          return {
      posts: data.data.children.map(child => ({
        id: child.data.id,
        title: child.data.title,
        url: child.data.url.startsWith('http') ? child.data.url : `https://reddit.com${child.data.permalink}`,
        subreddit: child.data.subreddit,
        score: child.data.score,
        numComments: child.data.num_comments,
        author: child.data.author,
        created: new Date(child.data.created_utc * 1000),
        selftext: child.data.selftext,
      })) as FormattedRedditPost[],
            after: data.data.after,
          };
        } catch (error) {
    console.error(`Error fetching posts from r/${subreddit}:`, error);
          return { posts: [], after: null };
        }
}

async function fetchMultipleSubreddits(accessToken: string | null, limit = 100, sort: 'hot' | 'new' = 'hot') {
  // Check if we have a valid cache
  if (redditCache && Date.now() - redditCache.timestamp < CACHE_EXPIRATION) {
    console.log("Using cached Reddit posts");
    return {
      posts: redditCache.posts,
      after: redditCache.after
    };
  }

  // If no valid access token, return fallback data
  if (!accessToken) {
    console.warn("No Reddit access token available, using fallback data");
    return {
      posts: fallbackRedditPosts,
      after: null
    };
  }

  // Reduced list of subreddits to minimize API requests
  const subreddits = [
    'programming',
    'javascript',
    'reactjs',
    'nextjs',
    'webdev'
  ];

  const postsPerSubreddit = Math.ceil(limit / subreddits.length);
  
  // Execute requests sequentially to avoid rate limiting
  const allPosts: FormattedRedditPost[] = [];
  let lastAfter: string | null = null;

  for (const subreddit of subreddits) {
    try {
      // Add a small delay between requests to avoid rate limiting
      if (subreddits.indexOf(subreddit) > 0) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      const result = await fetchSubredditPosts(subreddit, accessToken, postsPerSubreddit, '', sort);
      allPosts.push(...result.posts);
      
      // Use the 'after' from the last successfully fetched subreddit
      if (subreddits.indexOf(subreddit) === subreddits.length - 1) {
        lastAfter = result.after;
      }
    } catch (error) {
      console.warn(`Failed to fetch posts from subreddit: ${subreddit}, Error:`, error);
    }
  }

  // Optional: Sort combined posts if needed, e.g., by creation date if sort is 'new'
  if (sort === 'new') {
    allPosts.sort((a, b) => b.created.getTime() - a.created.getTime());
  } else {
    // Sort by score for 'hot'
    allPosts.sort((a, b) => b.score - a.score);
  }

  // Update cache
  redditCache = {
    posts: allPosts,
    timestamp: Date.now(),
    after: lastAfter
  };

  return {
    posts: allPosts.length > 0 ? allPosts : fallbackRedditPosts, // Use fallback if no posts were fetched
    after: lastAfter, // Note: This 'after' might not be perfectly sequential for multi-subreddit fetch
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const after = searchParams.get('after') || ''; // Ensure after is always a string
    const sortParam = searchParams.get('sort') || 'hot';
    const sort = (sortParam === 'new' ? 'new' : 'hot') as 'hot' | 'new'; // Ensure sort is either hot or new

    // Check if we have cached data for the first page
    if (page === 1 && redditCache && Date.now() - redditCache.timestamp < CACHE_EXPIRATION) {
      console.log("Using cached Reddit posts for first page");
      return NextResponse.json({
        posts: redditCache.posts,
        after: redditCache.after
      });
    }

    const accessToken = await getRedditAccessToken();
    
    let data;
    if (page === 1) {
      // Initial load: Fetch from multiple subreddits
      data = await fetchMultipleSubreddits(accessToken, 100, sort);
    } else if (accessToken) {
      // Subsequent loads: Fetch from a primary subreddit
      data = await fetchSubredditPosts('programming', accessToken, 20, after, sort);
      
      // If no posts were fetched or there was an error, use fallback
      if (data.posts.length === 0) {
        // Calculate which fallback posts to return based on page number
        const startIdx = (page - 2) * 20 % fallbackRedditPosts.length;
        data = {
          posts: fallbackRedditPosts.slice(startIdx, startIdx + 20),
          after: `t3_fallback_${page}`
        };
      }
    } else {
      // No access token, use fallback data
      data = {
        posts: fallbackRedditPosts,
        after: null
      };
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in Reddit API GET handler:', error);
    // Return fallback data on error
    return NextResponse.json({
      posts: fallbackRedditPosts,
      after: null
    });
  }
} 