import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMessages, addMessage } from '@/lib/redis';

// Helper function to make API responses consistent
function apiResponse(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

// Use the recommended pattern for dynamic API routes in Next.js 13+
export async function GET(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return apiResponse({ error: 'Unauthorized' }, 401);
    }

    // Access the chatId directly from the params object
    const chatId = params.chatId;
    console.log("GET messages for chatId:", chatId);

    if (!chatId) {
      return apiResponse({ error: 'Invalid chat ID' }, 400);
    }

    try {
      const messages = await getMessages(chatId);
      return apiResponse({ messages });
    } catch (error) {
      console.error(`Redis error fetching messages for chat ${chatId}:`, error);
      return apiResponse({ error: 'Database error', details: String(error) }, 500);
    }
  } catch (error) {
    console.error('Unhandled error in GET messages:', error);
    return apiResponse({ error: 'Internal Server Error' }, 500);
  }
}

export async function POST(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return apiResponse({ error: 'Unauthorized' }, 401);
    }

    // Access the chatId directly from the params object
    const chatId = params.chatId;
    console.log("POST message to chatId:", chatId);
    
    if (!chatId) {
      return apiResponse({ error: 'Invalid chat ID' }, 400);
    }
    
    // Parse request body with error handling
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return apiResponse({ error: 'Invalid JSON in request body' }, 400);
    }
    
    const { content } = body;
    
    if (!content || typeof content !== 'string') {
      return apiResponse({ error: 'Invalid message content' }, 400);
    }
    
    const message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      senderId: session.user.email,
      timestamp: Date.now(),
    };
    
    // Save message to Redis
    try {
      await addMessage(chatId, message);
      return apiResponse({ message, success: true });
    } catch (error) {
      console.error(`Redis error adding message to chat ${chatId}:`, error);
      return apiResponse({ error: 'Database error', details: String(error) }, 500);
    }
  } catch (error) {
    console.error('Unhandled error in POST message:', error);
    return apiResponse({ error: 'Internal Server Error' }, 500);
  }
} 