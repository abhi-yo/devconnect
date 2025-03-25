import { initTRPC, TRPCError } from "@trpc/server"
import { getServerSession } from "next-auth"
import superjson from "superjson"
import { ZodError } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redis } from "@/lib/redis"
import { postRouter } from "./routers/post"
import { topicRouter } from "./routers/topic"
import { userRouter } from "./routers/user"
import { notificationRouter } from "./routers/notification"

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await getServerSession(authOptions)

  return {
    prisma,
    redis,
    session,
    ...opts,
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createCallerFactory = t.createCallerFactory
export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({
    ctx: {
      session: ctx.session,
      user: ctx.session.user,
    },
  })
})

export const appRouter = router({
  post: postRouter,
  user: userRouter,
  topic: topicRouter,
  notification: notificationRouter,
})

export type AppRouter = typeof appRouter

