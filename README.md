# DevConnect

DevConnect is a modern social platform for developers to connect, share ideas, and collaborate on projects. Built with Next.js, TypeScript, and Prisma, it provides a seamless experience for developers to engage with the community.

## Features

- **User Authentication**: Secure sign-up and login with email/password or OAuth providers
- **Profile Management**: Customize your developer profile with bio, location, and social links
- **Post Creation**: Share updates, code snippets, and thoughts with the community
- **Social Interactions**: Like, comment, and follow other developers
- **Real-time Chat**: Connect with other developers through instant messaging
- **Topic-based Exploration**: Discover content based on programming topics and interests
- **Notifications**: Stay updated with activity related to your posts and profile
- **Responsive Design**: Optimized for both desktop and mobile experiences

## Tech Stack

- **Frontend**: Next.js 15, React 18, TailwindCSS
- **UI Components**: Radix UI, Shadcn UI
- **State Management**: React Query, TanStack
- **Backend**: Next.js API Routes, tRPC
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **Real-time Features**: Socket.io
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/devconnect.git
   cd devconnect
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env.local` file with the following variables:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/devconnect"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Initialize the database
   ```
   npx prisma migrate dev
   ```

5. Start the development server
   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/app`: Next.js app router pages and layouts
- `/components`: Reusable UI components
- `/lib`: Utility functions and shared logic
- `/prisma`: Database schema and migrations
- `/public`: Static assets
- `/styles`: Global CSS and styling utilities
- `/types`: TypeScript type definitions
- `/hooks`: Custom React hooks

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 