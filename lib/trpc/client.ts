import { createTRPCReact } from "@trpc/react-query"
import { httpBatchLink } from "@trpc/client"
import { QueryClient } from "@tanstack/react-query"
import superjson from "superjson"
import type { AppRouter } from "@/lib/trpc/root"

export const trpc = createTRPCReact<AppRouter>()

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

export const trpcClient = trpc.createClient({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: "/api/trpc",
    }),
  ],
})

