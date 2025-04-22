import { initTRPC, TRPCError } from "@trpc/server"
import type { CreateNextContextOptions } from "@trpc/server/adapters/next"
import type { inferAsyncReturnType } from "@trpc/server"
import { getServerSession, type Session } from "next-auth"
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
  username?: string // Added username based on auth.ts
}

interface CreateContextOptions {
  headers: Headers
}

// Define context including prisma, redis, and potentially session
interface BaseContext {
  prisma: typeof prisma;
  redis: typeof redis;
  session: Session | null;
  headers: Headers;
}

// Define context for authenticated procedures
interface AuthenticatedContext extends BaseContext {
  session: Session & { user: User }; // Session and user guaranteed to be non-null
  user: User;
}

// Export context types for use in routers
export type { Context, AuthenticatedContext };

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
  // Temporarily remove custom error formatter to isolate type issues
  // errorFormatter: formatError, 
})

// Middleware to enforce authentication
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // Assert user type based on your auth.ts session callback
  const user = ctx.session.user as User;
  
  if (!user.id) {
    // This should technically not happen if your auth setup is correct
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "User ID missing from session" });
  }

  return next({
    ctx: {
      ...ctx,
      // Provide the strongly-typed session and user to downstream procedures
      session: ctx.session as Session & { user: User },
      user: user,
    } as AuthenticatedContext, // Explicitly cast the context type
  });
});

export const createCallerFactory = t.createCallerFactory
export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed); 