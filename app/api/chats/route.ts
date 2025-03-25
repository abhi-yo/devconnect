import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redis, getUserChats, createChat } from '@/lib/redis';

// Helper function to make API responses consistent
function apiResponse(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return apiResponse({ error: 'Unauthorized' }, 401);
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return apiResponse({ error: 'Missing userId' }, 400);
    }

    console.log(`Fetching chats for user: ${userId}`);
    
    // Get user chats with error handling
    try {
      const chats = await getUserChats(userId);
      console.log(`Found ${chats.length} chats for user ${userId}`);
      return apiResponse({ chats });
    } catch (error) {
      console.error('Redis error fetching chats:', error);
      return apiResponse({ error: 'Database error', details: String(error) }, 500);
    }
  } catch (error) {
    console.error('Unhandled error in GET /api/chats:', error);
    return apiResponse({ error: 'Internal Server Error' }, 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return apiResponse({ error: 'Unauthorized' }, 401);
    }

    // Parse request body with error handling
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return apiResponse({ error: 'Invalid JSON in request body' }, 400);
    }
    
    const { participants } = body;

    if (!Array.isArray(participants) || participants.length < 2) {
      return apiResponse({ error: 'Invalid participants (need at least 2)' }, 400);
    }

    console.log(`Creating chat between ${participants.join(' and ')}`);
    
    // Extract first two participants (in case there are more)
    const [user1, user2] = participants;
    
    // Create chat with error handling
    try {
      const chatId = await createChat(user1, user2);
      console.log(`Created chat with ID: ${chatId}`);
      
      // Send a welcome message
      const welcomeMessage = {
        id: `system-${Date.now()}`,
        content: "Chat created. You can now start messaging.",
        senderId: "system",
        timestamp: Date.now(),
      };
      
      // Add initial system message to help with chat display
      try {
        await redis.lpush(`chat:${chatId}:messages`, JSON.stringify(welcomeMessage));
        console.log(`Added welcome message to chat ${chatId}`);
      } catch (error) {
        console.error(`Error adding welcome message to chat ${chatId}:`, error);
        // Continue anyway - welcome message is not critical
      }
      
      return apiResponse({ chatId, success: true });
    } catch (error) {
      console.error('Redis error creating chat:', error);
      return apiResponse({ error: 'Database error', details: String(error) }, 500);
    }
  } catch (error) {
    console.error('Unhandled error in POST /api/chats:', error);
    return apiResponse({ error: 'Internal Server Error' }, 500);
  }
} 