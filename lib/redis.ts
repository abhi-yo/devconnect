import { Redis } from "ioredis"

const redisUrl = process.env.UPSTASH_REDIS_REST_URL as string

// Constants for Redis TTLs and limits
const CHAT_TTL = 60 * 60 * 24 * 30 // 30 days in seconds
const MESSAGE_TTL = 60 * 60 * 24 * 7 // 7 days in seconds
const MAX_MESSAGES = 100 // Maximum messages to keep per chat

// Create a Redis client with error handling
let redis: Redis;

try {
  if (!redisUrl) {
    console.error('Redis URL not provided in environment variables');
    throw new Error('Redis URL not configured');
  }
  
  redis = new Redis(redisUrl);
  
  // Set up error handler
  redis.on('error', (err) => {
    console.error('Redis connection error:', err);
  });
  
  console.log('Redis client initialized');
} catch (error) {
  console.error('Failed to initialize Redis client:', error);
  // Create a dummy Redis client for development/testing
  redis = {} as Redis;
}

export { redis };

export async function createChat(userId1: string, userId2: string) {
  try {
    const timestamp = Date.now();
    const chatIdRaw = `${timestamp}`;
    const chatId = `chat:${chatIdRaw}`;
    
    // Create chat entries with TTL
    await redis.sadd(`user:${userId1}:chats`, chatId);
    await redis.sadd(`user:${userId2}:chats`, chatId);
    await redis.sadd(`chat:${chatId}:members`, userId1, userId2);
    
    // Set TTL for chat-related keys
    await redis.expire(`user:${userId1}:chats`, CHAT_TTL);
    await redis.expire(`user:${userId2}:chats`, CHAT_TTL);
    await redis.expire(`chat:${chatId}:members`, CHAT_TTL);
    
    // Return just the raw chatId for easier client usage
    return chatIdRaw;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
}

export async function getUserChats(userId: string) {
  try {
    const chatIdsWithPrefix = await redis.smembers(`user:${userId}:chats`);
    
    // Refresh TTL when accessed
    if (chatIdsWithPrefix && chatIdsWithPrefix.length > 0) {
      await redis.expire(`user:${userId}:chats`, CHAT_TTL);
    }
    
    // Remove the 'chat:' prefix for consistency
    return (chatIdsWithPrefix || []).map(id => id.replace('chat:', ''));
  } catch (error) {
    console.error(`Error getting chats for user ${userId}:`, error);
    return [];
  }
}

export async function getMessages(chatId: string, limit = 50) {
  try {
    const redisKey = `chat:${chatId}:messages`;
    const messages = await redis.lrange(redisKey, 0, limit - 1);
    
    // Refresh TTL when accessed
    if (messages && messages.length > 0) {
      await redis.expire(redisKey, MESSAGE_TTL);
    }
    
    // Parse JSON with error handling
    return (messages || []).map(msg => {
      try {
        return JSON.parse(msg);
      } catch (e) {
        console.error('Error parsing message JSON:', e);
        return { error: 'Invalid message format', rawMessage: msg };
      }
    });
  } catch (error) {
    console.error(`Error getting messages for chat ${chatId}:`, error);
    return [];
  }
}

export async function addMessage(chatId: string, message: any) {
  try {
    const redisKey = `chat:${chatId}:messages`;
    await redis.lpush(redisKey, JSON.stringify(message));
    
    // Trim old messages to prevent unbounded growth
    await redis.ltrim(redisKey, 0, MAX_MESSAGES - 1);
    
    // Set/refresh TTL for messages
    await redis.expire(redisKey, MESSAGE_TTL);
    
    // Refresh chat TTL since it's active
    await redis.expire(`chat:${chatId}:members`, CHAT_TTL);
    
    return true;
  } catch (error) {
    console.error(`Error adding message to chat ${chatId}:`, error);
    throw error;
  }
}

export async function getChatMembers(chatId: string) {
  try {
    const redisKey = `chat:${chatId}:members`;
    const members = await redis.smembers(redisKey);
    
    // Refresh TTL when accessed
    if (members && members.length > 0) {
      await redis.expire(redisKey, CHAT_TTL);
    }
    
    return members || [];
  } catch (error) {
    console.error(`Error getting members for chat ${chatId}:`, error);
    return [];
  }
}

// Utility function to cleanup old messages
export async function cleanupOldMessages(chatId: string) {
  try {
    const key = `chat:${chatId}:messages`
    const count = await redis.llen(key)
    if (count > MAX_MESSAGES) {
      await redis.ltrim(key, 0, MAX_MESSAGES - 1)
    }
    return true;
  } catch (error) {
    console.error(`Error cleaning up messages for chat ${chatId}:`, error);
    return false;
  }
}

