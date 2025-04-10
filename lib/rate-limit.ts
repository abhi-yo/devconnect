// In-memory store for rate limiting
const inMemoryStore = new Map<string, { count: number; timestamp: number }>()

interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

export async function rateLimit(
  identifier: string,
  maxAttempts = 5,
  windowMs = 5 * 60 * 1000 // 5 minutes
): Promise<RateLimitResult> {
  const now = Date.now()
  const record = inMemoryStore.get(identifier)
  const expired = record && (now - record.timestamp) > windowMs

  // Clear expired records
  if (record && expired) {
    inMemoryStore.delete(identifier)
  }

  // If no record exists or it has expired, create a new one
  if (!record || expired) {
    inMemoryStore.set(identifier, { count: 1, timestamp: now })
    return {
      success: true,
      remaining: maxAttempts - 1,
      reset: now + windowMs,
    }
  }

  // Increment the counter
  record.count++
  
  // Check if limit is exceeded
  const remaining = Math.max(0, maxAttempts - record.count)
  const success = record.count <= maxAttempts

  // Clean up old records periodically
  if (inMemoryStore.size > 10000) {
    const oldEntries = Array.from(inMemoryStore.entries())
      .filter(([_, value]) => (now - value.timestamp) > windowMs)
    oldEntries.forEach(([key]) => inMemoryStore.delete(key))
  }

  return {
    success,
    remaining,
    reset: record.timestamp + windowMs,
  }
} 