import { router, publicProcedure } from "@/lib/trpc/trpc"

export const topicRouter = router({
  getTrending: publicProcedure.query(async ({ ctx }) => {
    // This would typically use Redis for caching trending topics
    // For now, we'll just return some mock data
    return [
      { id: "1", name: "JavaScript", slug: "javascript", postCount: 1243 },
      { id: "2", name: "React", slug: "react", postCount: 982 },
      { id: "3", name: "NextJS", slug: "nextjs", postCount: 879 },
      { id: "4", name: "TypeScript", slug: "typescript", postCount: 654 },
      { id: "5", name: "TailwindCSS", slug: "tailwindcss", postCount: 432 },
    ]
  }),
})

