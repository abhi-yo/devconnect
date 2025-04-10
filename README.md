# DevConnect

A modern social platform for developers to connect, share ideas, and collaborate on projects. Built with Next.js 15, TypeScript, and Prisma, it provides a seamless experience for developers to engage with the community.

## Core Features

- **Authentication**
  - Email/Password and GitHub OAuth
  - Email verification system using Resend
  - Rate limiting for security
  - JWT-based session management

- **Social Features**
  - Post creation and sharing
  - Like and comment system
  - User following/followers
  - Real-time notifications
  - Profile customization

- **Explore Section**
  - Trending developers
  - Popular topics
  - GitHub trending repositories
  - Dev.to article integration
  - Reddit developer content

- **UI/UX**
  - Modern, responsive design
  - Dark/Light theme support
  - Real-time updates
  - Smooth animations
  - Mobile-first approach

## Tech Stack

- **Frontend**
  - Next.js 15 (App Router)
  - React 18
  - TailwindCSS
  - Radix UI Components
  - Framer Motion

- **Backend**
  - tRPC for type-safe APIs
  - Prisma ORM
  - PostgreSQL (via Neon)
  - Redis (via Upstash)
  - Socket.IO for real-time features

- **Authentication & Security**
  - NextAuth.js
  - bcrypt for password hashing
  - Rate limiting
  - Email verification

- **External APIs**
  - GitHub API
  - Dev.to API
  - Reddit API
  - Resend for emails

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── providers/         # Context providers
│   └── [other routes]/    # Application routes
├── components/
│   ├── auth/             # Authentication components
│   ├── new-ui/           # Main UI components
│   ├── profile/          # Profile related components
│   └── ui/               # Reusable UI components
├── lib/
│   ├── trpc/            # tRPC configuration
│   ├── auth.ts          # Auth configuration
│   ├── prisma.ts        # Database client
│   └── utils.ts         # Utility functions
└── prisma/              # Database schema
```

## Environment Setup

Create a `.env` file with the following variables:

```env
# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Database
DATABASE_URL="your-neon-postgres-url"

# Redis
UPSTASH_REDIS_REST_URL="your-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Email
RESEND_API_KEY="your-resend-api-key"

# External APIs
GITHUB_ACCESS_TOKEN="your-github-token"
REDDIT_CLIENT_ID="your-reddit-client-id"
REDDIT_CLIENT_SECRET="your-reddit-client-secret"
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables in `.env`

3. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment Checklist

1. **Database**
   - Ensure Prisma schema is up to date
   - Run migrations on production database
   - Verify connection string in environment variables

2. **Authentication**
   - Configure OAuth providers in production
   - Update callback URLs
   - Set proper NEXTAUTH_URL

3. **API Keys**
   - Verify all API keys are set
   - Configure rate limits for production
   - Set up monitoring

4. **Caching**
   - Configure Redis for production
   - Set up proper cache invalidation
   - Monitor cache usage

5. **Performance**
   - Enable image optimization
   - Configure proper CDN caching
   - Set up error monitoring

## Known Issues and Solutions

1. **Rate Limiting**: Implement proper rate limiting for all API endpoints
2. **Socket Connection**: Ensure proper WebSocket configuration in production
3. **Image Optimization**: Configure proper image handling and optimization
4. **API Response Caching**: Implement efficient caching strategies

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 