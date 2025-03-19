import { Redis } from "ioredis"

const redisUrl = process.env.UPSTASH_REDIS_REST_URL as string

// Constants for Redis TTLs and limits
const CHAT_TTL = 60 * 60 * 24 * 30 // 30 days in seconds
const MESSAGE_TTL = 60 * 60 * 24 * 7 // 7 days in seconds
const MAX_MESSAGES = 100 // Maximum messages to keep per chat

export const redis = new Redis(redisUrl)

export async function createChat(userId1: string, userId2: string) {
  const chatId = `chat:${Date.now()}`
  
  // Create chat entries with TTL
  await redis.sadd(`user:${userId1}:chats`, chatId)
  await redis.sadd(`user:${userId2}:chats`, chatId)
  await redis.sadd(`chat:${chatId}:members`, userId1, userId2)
  
  // Set TTL for chat-related keys
  await redis.expire(`user:${userId1}:chats`, CHAT_TTL)
  await redis.expire(`user:${userId2}:chats`, CHAT_TTL)
  await redis.expire(`chat:${chatId}:members`, CHAT_TTL)
  
  return chatId
}

export async function getUserChats(userId: string) {
  const chatIds = await redis.smembers(`user:${userId}:chats`)
  // Refresh TTL when accessed
  if (chatIds.length > 0) {
    await redis.expire(`user:${userId}:chats`, CHAT_TTL)
  }
  return chatIds
}

export async function getMessages(chatId: string, limit = 50) {
  const messages = await redis.lrange(`chat:${chatId}:messages`, 0, limit - 1)
  // Refresh TTL when accessed
  if (messages.length > 0) {
    await redis.expire(`chat:${chatId}:messages`, MESSAGE_TTL)
  }
  return messages.map(msg => JSON.parse(msg))
}

export async function addMessage(chatId: string, message: any) {
  const key = `chat:${chatId}:messages`
  await redis.lpush(key, JSON.stringify(message))
  
  // Trim old messages to prevent unbounded growth
  await redis.ltrim(key, 0, MAX_MESSAGES - 1)
  
  // Set/refresh TTL for messages
  await redis.expire(key, MESSAGE_TTL)
  
  // Refresh chat TTL since it's active
  await redis.expire(`chat:${chatId}:members`, CHAT_TTL)
}

export async function getChatMembers(chatId: string) {
  const members = await redis.smembers(`chat:${chatId}:members`)
  // Refresh TTL when accessed
  if (members.length > 0) {
    await redis.expire(`chat:${chatId}:members`, CHAT_TTL)
  }
  return members
}

// New utility function to cleanup old messages
export async function cleanupOldMessages(chatId: string) {
  const key = `chat:${chatId}:messages`
  const count = await redis.llen(key)
  if (count > MAX_MESSAGES) {
    await redis.ltrim(key, 0, MAX_MESSAGES - 1)
  }
}

