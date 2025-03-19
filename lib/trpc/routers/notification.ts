import { z } from "zod"
import { router, protectedProcedure } from "@/lib/trpc/trpc"
import { NotificationService } from "@/lib/services/notification"

export const notificationRouter = router({
  getAll: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100), cursor: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input
      const userId = ctx.user.id

      const notifications = await ctx.prisma.notification.findMany({
        where: { userId },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
      })

      let nextCursor: string | undefined = undefined
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
    return NotificationService.getUnreadCount(ctx.user.id)
  }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input
      const userId = ctx.user.id

      await ctx.prisma.notification.update({
        where: { id, userId },
        data: { isRead: true },
      })

      return { success: true }
    }),

  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.user.id

      await ctx.prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      })

      return { success: true }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return NotificationService.delete(input.id, ctx.user.id)
    }),
}) 