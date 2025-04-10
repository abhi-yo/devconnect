import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { appRouter } from "@/lib/trpc/root"
import { createTRPCContext } from "@/lib/trpc/trpc"

export const runtime = "nodejs"

export function GET(request: Request, { params }: { params: { trpc: string } }) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: request.headers }),
    onError({ error }) {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.error("An error occurred:", error)
      }
    },
  })
}

export function POST(request: Request, { params }: { params: { trpc: string } }) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: request.headers }),
    onError({ error }) {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.error("An error occurred:", error)
      }
    },
  })
}

