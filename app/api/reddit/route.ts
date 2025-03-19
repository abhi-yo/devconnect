import { NextResponse } from 'next/server';

const subreddits = [
  'programming',
  'webdev',
  'javascript',
  'reactjs',
  'typescript',
  'coding',
  'learnprogramming',
  'node',
  'python',
  'rust',
  'golang',
  'java',
  'csharp',
  'cpp',
  'devops',
];

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const after = searchParams.get('after') || '';
  const sort = searchParams.get('sort') || 'top';
  const limit = 25;
  const t = 'week';

  try {
    // Get posts from each subreddit based on sort type
    const allPosts = await Promise.all(
      subreddits.map(async (subreddit) => {
        try {
          const sortType = sort === 'new' ? 'new' : 'top';
          const url = sortType === 'top'
            ? `https://www.reddit.com/r/${subreddit}/${sortType}.json?limit=${limit}&after=${after}&t=${t}`
            : `https://www.reddit.com/r/${subreddit}/${sortType}.json?limit=${limit}&after=${after}`;

          const response = await fetch(url, {
            headers: {
              'User-Agent': 'DevConnect:v1.0.0 (by /u/devconnect)',
            },
            next: { revalidate: 300 },
          });

          if (!response.ok) {
            console.error(`Failed to fetch from r/${subreddit}:`, response.status, response.statusText);
            return { posts: [], after: null };
          }

          const data = await response.json();
          return {
            posts: data.data.children.map((child: any) => {
              const post = child.data;
              return {
                id: post.id,
                title: post.title,
                url: `https://reddit.com${post.permalink}`,
                subreddit: post.subreddit_name_prefixed,
                score: post.score,
                numComments: post.num_comments,
                author: post.author,
                created: new Date(post.created_utc * 1000),
                thumbnail: post.thumbnail !== 'self' ? post.thumbnail : null,
                selftext: post.selftext,
              };
            }),
            after: data.data.after,
          };
        } catch (error) {
          console.error(`Error fetching from r/${subreddit}:`, error);
          return { posts: [], after: null };
        }
      })
    );

    // Combine all posts and their 'after' tokens
    const posts = allPosts.flatMap(result => result.posts);
    const lastAfter = allPosts.find(result => result.after)?.after || null;

    // Sort posts based on the criteria
    const sortedPosts = sort === 'new' 
      ? posts.sort((a: RedditPost, b: RedditPost) => 
          new Date(b.created).getTime() - new Date(a.created).getTime()
        )
      : posts.sort((a: RedditPost, b: RedditPost) => b.score - a.score);

    if (posts.length === 0) {
      return NextResponse.json(
        { error: 'No posts found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      posts: sortedPosts.slice(0, limit),
      after: lastAfter
    });
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Reddit posts' },
      { status: 500 }
    );
  }
} 