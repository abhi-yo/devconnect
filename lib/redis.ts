import { Redis } from "ioredis"

const redisUrl = process.env.UPSTASH_REDIS_REST_URL as string
export const redis = new Redis(redisUrl)

// Add any non-chat related Redis functions here if needed in the future 