import { TRPCError } from "@trpc/server"
import { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc"
import { ZodError } from "zod"

interface ErrorShape {
  message: string
  code: TRPC_ERROR_CODE_KEY
  data?: {
    code: string
    httpStatus: number
    path?: string
    stack?: string
    zodError?: ZodError
  }
}

export function formatError({ shape, error }: { shape: ErrorShape; error: TRPCError }) {
  return {
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    },
  }
} 