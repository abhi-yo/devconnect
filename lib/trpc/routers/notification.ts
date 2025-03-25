import { z } from "zod"
import { router, protectedProcedure } from "@/lib/trpc/trpc"

// Helper function to create notifications with proper typing
export async function createNotification(prisma: any, data: {
  userId: string;
  title: string;
  body: string;
  link?: string;
  image?: string;
  read?: boolean;
}) {
  return await prisma.notification.create({
    data
  });
}

export const notificationRouter = router({
  getAll: protectedProcedure
    .input(z.object({ 
      limit: z.number().min(1).max(100).optional().default(20),
      cursor: z.string().optional() 
    }))
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input
      const userId = ctx.user.id

      const notifications = await ctx.prisma.notification.findMany({
        where: { userId },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (notifications.length > limit) {
        const nextItem = notifications.pop()
        nextCursor = nextItem!.id
      }

      return {
        notifications,
        nextCursor,
      }
    }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.prisma.notification.count({
      where: {
        userId: ctx.user.id,
        read: false,
      },
    })
    return count
  }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input
      const userId = ctx.user.id

      await ctx.prisma.notification.update({
        where: { id, userId },
        data: { read: true },
      })

      return { success: true }
    }),

  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.user.id

      await ctx.prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      })

      return { success: true }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input
      const userId = ctx.user.id

      await ctx.prisma.notification.delete({
        where: {
          id,
          userId, // Ensure user can only delete their own notifications
        },
      })

      return { success: true }
    }),
}) 