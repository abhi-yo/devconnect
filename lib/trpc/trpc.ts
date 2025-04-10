import { initTRPC, TRPCError } from "@trpc/server"
import type { CreateNextContextOptions } from "@trpc/server/adapters/next"
import type { inferAsyncReturnType } from "@trpc/server"
import { getServerSession } from "next-auth"
import superjson from "superjson"
import { ZodError } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redis } from "@/lib/redis"
import { formatError } from "./error-formatter"

// Define the session user type
interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface CreateContextOptions {
  headers: Headers
}

export const createTRPCContext = async ({ headers }: CreateContextOptions) => {
  const session = await getServerSession(authOptions)

  return {
    prisma,
    redis,
    session,
    headers,
  }
}

type Context = inferAsyncReturnType<typeof createTRPCContext>

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter: formatError,
})

export const createCallerFactory = t.createCallerFactory
export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(
  ({ ctx, next }: { ctx: Context; next: any }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }
    return next({
      ctx: {
        ...ctx,
        session: ctx.session,
        user: ctx.session.user as User,
      },
    })
  }
) 